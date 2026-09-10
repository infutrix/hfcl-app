/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { createSocket, Socket } from 'node:dgram';
import {
  AI_DISCOVERY_ENABLED,
  AI_DISCOVERY_MAX_TIMESTAMP_AGE_MS,
  AI_DISCOVERY_MESSAGE_TYPE,
  AI_DISCOVERY_PORT,
  AI_DISCOVERY_PROTOCOL_VERSION,
  AI_SERVER_FALLBACK_URL,
  AI_SERVER_OFFLINE_TIMEOUT_MS,
} from './ai-discovery.constants';
import { verifyDiscoverySignature } from './discovery.crypto';

interface RawAiDiscoveryPayload {
  type?: unknown;
  version?: unknown;
  host?: unknown;
  port?: unknown;
  timestamp?: unknown;
  signature?: unknown;
}

interface DiscoveredAiServer {
  host: string;
  port: number;
  lastSeenAt: number;
}

export interface AiServerStatus {
  available: boolean;
  url: string | null;
  lastSeen: number | null;
}

/**
 * Independent from MainServerDiscoveryService: its own socket, own UDP port
 * (41235), own secret (HFCL_AI_DISCOVERY_SECRET), and own state. Neither
 * discovery service can affect the other's availability or address.
 */
@Injectable()
export class AiServerDiscoveryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AiServerDiscoveryService.name);
  private readonly secret = process.env.HFCL_AI_DISCOVERY_SECRET;

  private socket: Socket | null = null;
  private discovered: DiscoveredAiServer | null = null;

  onModuleInit(): void {
    if (!AI_DISCOVERY_ENABLED) {
      this.logger.log(
        'AI server discovery is disabled (HFCL_AI_DISCOVERY_ENABLED=false).',
      );
      return;
    }
    if (!this.secret) {
      this.logger.warn(
        'HFCL_AI_DISCOVERY_SECRET is not set — AI server discovery is disabled.',
      );
      return;
    }
    this.start();
  }

  onModuleDestroy(): void {
    this.stop();
  }

  /**
   * Returns the fresh UDP-discovered URL, or the configured HTTP fallback when
   * discovery has not found a currently available AI server.
   */
  getAiServerUrl(): string {
    if (!this.isAiServerAvailable()) {
      return AI_SERVER_FALLBACK_URL;
    }
    return `http://${this.discovered!.host}:${this.discovered!.port}`;
  }

  isAiServerAvailable(): boolean {
    if (!this.discovered) {
      return false;
    }
    return (
      Date.now() - this.discovered.lastSeenAt <= AI_SERVER_OFFLINE_TIMEOUT_MS
    );
  }

  /** Includes the last known URL even while offline, for diagnostics. */
  getAiServerStatus(): AiServerStatus {
    return {
      available: this.isAiServerAvailable(),
      url: this.getAiServerUrl(),
      lastSeen: this.discovered?.lastSeenAt ?? null,
    };
  }

  private start(): void {
    if (this.socket) {
      return; // avoid binding twice
    }

    const socket = createSocket({ type: 'udp4', reuseAddr: true });

    socket.on('error', (err) => {
      this.logger.error(
        `AI discovery listener socket error: ${err.message}`,
        err.stack,
      );
    });

    socket.on('message', (msg) => this.handleMessage(msg));

    socket.bind(AI_DISCOVERY_PORT, () => {
      this.logger.log(
        `Listening for AI server broadcasts on UDP ${AI_DISCOVERY_PORT}; fallback URL: ${AI_SERVER_FALLBACK_URL}`,
      );
    });

    this.socket = socket;
  }

  private stop(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private handleMessage(msg: Buffer): void {
    let payload: RawAiDiscoveryPayload;
    try {
      payload = JSON.parse(msg.toString('utf8'));
    } catch {
      return; // ignore malformed/non-JSON packets
    }

    if (!this.isWellFormed(payload)) {
      return;
    }

    const age = Date.now() - payload.timestamp;
    if (Math.abs(age) > AI_DISCOVERY_MAX_TIMESTAMP_AGE_MS) {
      this.logger.debug(
        'Ignoring AI server broadcast with stale or future timestamp.',
      );
      return;
    }

    if (!this.secret) {
      return;
    }

    const isValid = verifyDiscoverySignature(
      {
        type: payload.type,
        version: payload.version,
        host: payload.host,
        port: payload.port,
        timestamp: payload.timestamp,
      },
      payload.signature,
      this.secret,
    );

    if (!isValid) {
      this.logger.warn(
        `Ignoring AI server broadcast with invalid signature from ${payload.host}`,
      );
      return;
    }

    const isNewOrChanged =
      !this.discovered ||
      this.discovered.host !== payload.host ||
      this.discovered.port !== payload.port;

    this.discovered = {
      host: payload.host,
      port: payload.port,
      lastSeenAt: Date.now(),
    };

    if (isNewOrChanged) {
      this.logger.log(
        `Discovered AI server at ${payload.host}:${payload.port}`,
      );
    }
  }

  private isWellFormed(
    payload: RawAiDiscoveryPayload,
  ): payload is Required<RawAiDiscoveryPayload> & {
    type: string;
    version: number;
    host: string;
    port: number;
    timestamp: number;
    signature: string;
  } {
    return (
      payload.type === AI_DISCOVERY_MESSAGE_TYPE &&
      payload.version === AI_DISCOVERY_PROTOCOL_VERSION &&
      typeof payload.host === 'string' &&
      payload.host.length > 0 &&
      typeof payload.port === 'number' &&
      Number.isInteger(payload.port) &&
      payload.port > 0 &&
      payload.port < 65536 &&
      typeof payload.timestamp === 'number' &&
      Number.isFinite(payload.timestamp) &&
      typeof payload.signature === 'string' &&
      payload.signature.length > 0
    );
  }
}
