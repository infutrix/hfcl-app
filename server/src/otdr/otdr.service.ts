import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { SendSkippyCommandDto } from './dto/send-skippy-command.dto';
import { Socket } from 'net';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';

type ConnectionState = 'disconnected' | 'connecting' | 'connected';

interface ConnectionConfig {
  host: string;
  port: number;
  connectTimeoutMs: number;
  commandTimeoutMs: number;
}

interface UploadedImageFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface IbrPredictResponse {
  fiber?: {
    color?: string;
    confidence?: number;
  };
  ribbon?: {
    markings_score?: number;
  };
  strand?: {
    color?: string;
    confidence?: number;
  };
  status?: string;
}

@Injectable()
export class OtdrService implements OnModuleDestroy {
  private readonly lossAt1310Command =
    'source:wavelength 1310; *wai; initiate; *wai; trace:mdloss?';
  private readonly iorAt1310Command =
    'source:wavelength 1310; *wai; sense:fiber:ior?';
  private readonly initiateStateCommand = 'INITiate?';
  private readonly bCursorCommand = 'sense:bcursor?';
  private readonly aCursorCommand = 'sense:acursor?';
  private readonly runStorageDir = join(process.cwd(), 'public', 'otdr-runs');
  private readonly iBrPredictUrl =
    process.env.IBR_AI_PREDICT_URL ??
    'http://localhost:8000/api/v1/predict/ibr';
  private readonly iBrPredictTimeoutMs = 20000;

  private socket: Socket | null = null;
  private state: ConnectionState = 'disconnected';
  private isShuttingDown = false;

  private config: ConnectionConfig = {
    host: '192.168.1.38',
    port: 2288,
    connectTimeoutMs: 5000,
    commandTimeoutMs: 5000,
  };

  private commandChain: Promise<void> = Promise.resolve();

  async connection(createConnectionDto: CreateConnectionDto) {
    if (createConnectionDto.connectionType === 'connect') {
      return this.connect(createConnectionDto);
    }

    return this.disconnect();
  }

  getConnectionStatus() {
    return {
      state: this.state,
      host: this.config.host,
      port: this.config.port,
      connectTimeoutMs: this.config.connectTimeoutMs,
      commandTimeoutMs: this.config.commandTimeoutMs,
    };
  }

  async sendSkippyCommand(sendSkippyCommandDto: SendSkippyCommandDto) {
    const command = sendSkippyCommandDto.command?.trim();

    if (!command) {
      throw new BadRequestException('Command is required.');
    }

    const response = await this.enqueueCommand(() =>
      this.sendCommand(command, sendSkippyCommandDto.timeoutMs),
    );

    return {
      command,
      response,
    };
  }

  async runSkippyMetricsWithImage(
    image: UploadedImageFile,
    timeoutMs?: number,
  ) {
    if (!image.buffer || image.size <= 0) {
      throw new BadRequestException('Uploaded image is empty.');
    }

    if (!image.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Only image uploads are supported.');
    }

    await mkdir(this.runStorageDir, { recursive: true });

    const runId = `${Date.now()}-${randomUUID()}`;
    const imageExtension = this.resolveImageExtension(
      image.originalname,
      image.mimetype,
    );
    const imageFileName = `${runId}${imageExtension}`;
    const imageFilePath = join(this.runStorageDir, imageFileName);

    await writeFile(imageFilePath, image.buffer);

    const metricsResult = await this.enqueueCommand(async () => {
      const readyCheck = await this.waitUntilOtdrReady(timeoutMs);
      const lossResponse = await this.sendCommand(
        this.lossAt1310Command,
        timeoutMs,
      );
      const bCursorResponse = await this.sendCommand(
        this.bCursorCommand,
        timeoutMs,
      );
      const aCursorResponse = await this.sendCommand(
        this.aCursorCommand,
        timeoutMs,
      );
      const iorResponse = await this.sendCommand(
        this.iorAt1310Command,
        timeoutMs,
      );

      const lossValue = this.extractFirstNumber(lossResponse);
      const bCursor = this.extractFirstNumber(bCursorResponse);
      const aCursor = this.extractFirstNumber(aCursorResponse);
      const iorValue = this.extractFirstNumber(iorResponse);

      const length =
        aCursor !== null && bCursor !== null
          ? Math.abs(bCursor - aCursor)
          : null;

      return {
        readiness: readyCheck,
        metrics: {
          loss: lossValue,
          ior: iorValue,
          length,
          aCursor,
          bCursor,
        },
        responses: {
          loss: lossResponse,
          bCursor: bCursorResponse,
          aCursor: aCursorResponse,
          ior: iorResponse,
        },
        commands: {
          readiness: this.initiateStateCommand,
          loss: this.lossAt1310Command,
          bCursor: this.bCursorCommand,
          aCursor: this.aCursorCommand,
          ior: this.iorAt1310Command,
        },
      };
    });

    const otdrResponse = metricsResult.responses.loss;
    const colorPrediction = await this.predictIbrColor(image);
    const recordFileName = `${runId}.json`;
    const recordFilePath = join(this.runStorageDir, recordFileName);

    const record = {
      runId,
      command: this.lossAt1310Command,
      otdrResponse,
      readiness: metricsResult.readiness,
      metrics: metricsResult.metrics,
      responses: metricsResult.responses,
      commands: metricsResult.commands,
      colorPrediction,
      createdAt: new Date().toISOString(),
      image: {
        fileName: imageFileName,
        originalName: image.originalname,
        mimeType: image.mimetype,
        size: image.size,
      },
    };

    await writeFile(recordFilePath, JSON.stringify(record, null, 2), 'utf8');

    return {
      message: 'Skippy metrics with image executed successfully.',
      runId,
      command: this.lossAt1310Command,
      otdrResponse,
      readiness: metricsResult.readiness,
      metrics: metricsResult.metrics,
      responses: metricsResult.responses,
      commands: metricsResult.commands,
      colorPrediction,
      savedFiles: {
        image: join('public', 'otdr-runs', imageFileName),
        record: join('public', 'otdr-runs', recordFileName),
      },
    };
  }

  async onModuleDestroy(): Promise<void> {
    this.isShuttingDown = true;
    await this.disconnect();
  }

  private async connect(createConnectionDto: CreateConnectionDto) {
    if (this.state === 'connected') {
      return {
        message: 'Already connected to OTDR.',
        status: this.getConnectionStatus(),
      };
    }

    if (this.state === 'connecting') {
      throw new ServiceUnavailableException('OTDR connection is in progress.');
    }

    this.config = {
      host: createConnectionDto.host ?? this.config.host,
      port: createConnectionDto.port ?? this.config.port,
      connectTimeoutMs:
        createConnectionDto.connectTimeoutMs ?? this.config.connectTimeoutMs,
      commandTimeoutMs:
        createConnectionDto.commandTimeoutMs ?? this.config.commandTimeoutMs,
    };

    if (!Number.isInteger(this.config.port) || this.config.port <= 0) {
      throw new BadRequestException('Port must be a positive integer.');
    }

    if (
      this.config.connectTimeoutMs <= 0 ||
      this.config.commandTimeoutMs <= 0
    ) {
      throw new BadRequestException(
        'Timeout values must be greater than zero.',
      );
    }

    this.state = 'connecting';

    try {
      const socket = await this.createConnectedSocket();
      this.socket = socket;
      this.state = 'connected';

      return {
        message: 'Connected to OTDR.',
        status: this.getConnectionStatus(),
      };
    } catch (error) {
      this.socket?.destroy();
      this.socket = null;
      this.state = 'disconnected';

      throw new InternalServerErrorException({
        message: 'Unable to connect to OTDR.',
        reason: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async disconnect() {
    if (!this.socket || this.state === 'disconnected') {
      this.state = 'disconnected';

      return {
        message: 'OTDR is already disconnected.',
        status: this.getConnectionStatus(),
      };
    }

    await new Promise<void>((resolve) => {
      const activeSocket = this.socket;

      if (!activeSocket) {
        resolve();
        return;
      }

      const finalize = () => {
        activeSocket.removeAllListeners();
        resolve();
      };

      activeSocket.once('close', finalize);
      activeSocket.end();

      setTimeout(() => {
        if (!activeSocket.destroyed) {
          activeSocket.destroy();
        }
      }, 250);
    });

    this.socket = null;
    this.state = 'disconnected';

    return {
      message: this.isShuttingDown
        ? 'OTDR disconnected during shutdown.'
        : 'Disconnected from OTDR.',
      status: this.getConnectionStatus(),
    };
  }

  private createConnectedSocket(): Promise<Socket> {
    return new Promise<Socket>((resolve, reject) => {
      const socket = new Socket();
      let settled = false;

      const fail = (error: Error) => {
        if (settled) {
          return;
        }

        settled = true;
        socket.removeAllListeners();
        socket.destroy();
        reject(error);
      };

      socket.setNoDelay(true);
      socket.setKeepAlive(true, 10000);
      socket.setTimeout(this.config.connectTimeoutMs);

      socket.once('timeout', () => fail(new Error('Connection timeout.')));
      socket.once('error', (error) => fail(error));

      socket.connect(this.config.port, this.config.host, () => {
        if (settled) {
          return;
        }

        settled = true;
        socket.removeAllListeners('timeout');
        socket.removeAllListeners('error');
        socket.setTimeout(0);

        socket.on('error', () => {
          this.state = 'disconnected';
          this.socket = null;
        });

        socket.on('close', () => {
          this.state = 'disconnected';
          this.socket = null;
        });

        resolve(socket);
      });
    });
  }

  private enqueueCommand<T>(commandFn: () => Promise<T>): Promise<T> {
    const run = this.commandChain.then(commandFn, commandFn);

    this.commandChain = run.then(
      () => undefined,
      () => undefined,
    );

    return run;
  }

  private async waitUntilOtdrReady(timeoutMs?: number) {
    const attempts = 5;
    let lastResponse = '';

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      lastResponse = await this.sendCommand(
        this.initiateStateCommand,
        timeoutMs,
      );
      const stateValue = this.extractFirstNumber(lastResponse);

      if (stateValue === 0) {
        return {
          ready: true,
          attempts: attempt,
          raw: lastResponse,
        };
      }

      if (attempt < attempts) {
        await this.delay(250);
      }
    }

    return {
      ready: false,
      attempts,
      raw: lastResponse,
    };
  }

  private extractFirstNumber(value: string): number | null {
    const match = value.match(/[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/);

    if (!match) {
      return null;
    }

    const parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private resolveImageExtension(
    originalname: string,
    mimetype: string,
  ): string {
    const fileExtension = extname(originalname || '').toLowerCase();

    if (fileExtension) {
      return fileExtension;
    }

    const byMimeType: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'image/bmp': '.bmp',
      'image/tiff': '.tiff',
    };

    return byMimeType[mimetype] ?? '.img';
  }

  private async predictIbrColor(
    image: UploadedImageFile,
  ): Promise<IbrPredictResponse> {
    const formData = new FormData();
    const fileBytes = Uint8Array.from(image.buffer);
    const blob = new Blob([fileBytes], {
      type: image.mimetype || 'application/octet-stream',
    });

    formData.append('file', blob, image.originalname || 'capture.jpg');

    const abortController = new AbortController();
    const timeout = setTimeout(() => {
      abortController.abort();
    }, this.iBrPredictTimeoutMs);

    let response: Response;

    try {
      response = await fetch(this.iBrPredictUrl, {
        method: 'POST',
        headers: {
          accept: 'application/json',
        },
        body: formData,
        signal: abortController.signal,
      });
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : 'Unknown network error';

      throw new ServiceUnavailableException({
        message: 'Unable to fetch color prediction from AI server.',
        reason,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const body = await response.text();

      throw new ServiceUnavailableException({
        message: 'AI server returned a non-success response.',
        statusCode: response.status,
        reason: body || response.statusText,
      });
    }

    const data = (await response.json()) as IbrPredictResponse;

    if (!data || typeof data !== 'object') {
      throw new InternalServerErrorException(
        'Invalid prediction payload returned by AI server.',
      );
    }

    return data;
  }

  private sendCommand(command: string, timeoutMs?: number): Promise<string> {
    if (!this.socket || this.state !== 'connected') {
      throw new ServiceUnavailableException('OTDR is not connected.');
    }

    const commandTimeoutMs = timeoutMs ?? this.config.commandTimeoutMs;

    if (commandTimeoutMs <= 0) {
      throw new BadRequestException(
        'Command timeout must be greater than zero.',
      );
    }

    return new Promise<string>((resolve, reject) => {
      const socket = this.socket;

      if (!socket) {
        reject(new ServiceUnavailableException('OTDR is not connected.'));
        return;
      }

      let buffer = '';

      const cleanup = () => {
        clearTimeout(timer);
        socket.off('data', onData);
        socket.off('error', onError);
        socket.off('close', onClose);
      };

      const onError = (error: Error) => {
        cleanup();
        reject(
          new ServiceUnavailableException({
            message: 'Failed while sending command to OTDR.',
            reason: error.message,
          }),
        );
      };

      const onClose = () => {
        cleanup();
        reject(new ServiceUnavailableException('OTDR connection closed.'));
      };

      const onData = (data: Buffer) => {
        buffer += data.toString('utf8');

        const lineEndIndex = buffer.search(/\r?\n/);
        if (lineEndIndex === -1) {
          return;
        }

        const response = buffer.slice(0, lineEndIndex).trim();
        cleanup();
        resolve(response);
      };

      const timer = setTimeout(() => {
        cleanup();
        reject(
          new ServiceUnavailableException(
            'Timed out waiting for OTDR response.',
          ),
        );
      }, commandTimeoutMs);

      socket.on('data', onData);
      socket.once('error', onError);
      socket.once('close', onClose);

      socket.write(`${command}\n`, 'utf8', (error) => {
        if (error) {
          onError(error);
        }
      });
    });
  }
}
