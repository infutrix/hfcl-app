/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { createSocket, Socket } from 'node:dgram';
import {
  DISCOVERY_MESSAGE_TYPE,
  DISCOVERY_PROTOCOL_VERSION,
  DISCOVERY_UDP_PORT,
  MAIN_SERVER_OFFLINE_TIMEOUT_MS,
  MAX_TIMESTAMP_SKEW_MS,
} from './discovery.constants';
import { verifyDiscoverySignature } from './discovery.crypto';

interface RawDiscoveryPayload {
  type?: unknown;
  version?: unknown;
  host?: unknown;
  port?: unknown;
  timestamp?: unknown;
  signature?: unknown;
}

interface DiscoveredMainServer {
  host: string;
  port: number;
  lastSeenAt: number;
}

/**
 * Listens for authenticated UDP broadcasts from hfcl-api and keeps track of
 * its current LAN address, so other services never need a hardcoded IP.
 * Registered as a global provider (see DiscoveryModule) so exactly one
 * listener binds per process even if imported from multiple modules.
 */
@Injectable()
export class MainServerDiscoveryService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(MainServerDiscoveryService.name);
  private readonly secret = process.env.HFCL_DISCOVERY_SECRET;

  private socket: Socket | null = null;
  private discovered: DiscoveredMainServer | null = null;

  onModuleInit(): void {
    if (!this.secret) {
      this.logger.warn(
        'HFCL_DISCOVERY_SECRET is not set — main server discovery is disabled.',
      );
      return;
    }
    this.start();
  }

  onModuleDestroy(): void {
    this.stop();
  }

  /** Returns the last discovered main server base URL, or null if unknown/offline. */
  getMainServerUrl(): string | null {
    if (!this.isMainServerAvailable()) {
      return null;
    }
    return `http://${this.discovered!.host}:${this.discovered!.port}`;
  }

  isMainServerAvailable(): boolean {
    if (!this.discovered) {
      return false;
    }
    return (
      Date.now() - this.discovered.lastSeenAt <= MAIN_SERVER_OFFLINE_TIMEOUT_MS
    );
  }

  getLastSeenAt(): number | null {
    return this.discovered?.lastSeenAt ?? null;
  }

  private start(): void {
    if (this.socket) {
      return; // avoid binding twice
    }

    const socket = createSocket({ type: 'udp4', reuseAddr: true });

    socket.on('error', (err) => {
      this.logger.error(
        `Discovery listener socket error: ${err.message}`,
        err.stack,
      );
    });

    socket.on('message', (msg) => this.handleMessage(msg));

    socket.bind(DISCOVERY_UDP_PORT, () => {
      this.logger.log(
        `Listening for main server broadcasts on UDP ${DISCOVERY_UDP_PORT}`,
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
    let payload: RawDiscoveryPayload;
    try {
      payload = JSON.parse(msg.toString('utf8'));
    } catch {
      return; // ignore malformed/non-JSON packets
    }

    if (!this.isWellFormed(payload)) {
      return;
    }

    const age = Date.now() - payload.timestamp;
    if (Math.abs(age) > MAX_TIMESTAMP_SKEW_MS) {
      this.logger.debug(
        'Ignoring discovery broadcast with stale or future timestamp.',
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
        `Ignoring discovery broadcast with invalid signature from ${payload.host}`,
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
        `Discovered main server at ${payload.host}:${payload.port}`,
      );
    }
  }

  private isWellFormed(
    payload: RawDiscoveryPayload,
  ): payload is Required<RawDiscoveryPayload> & {
    type: string;
    version: number;
    host: string;
    port: number;
    timestamp: number;
    signature: string;
  } {
    return (
      payload.type === DISCOVERY_MESSAGE_TYPE &&
      payload.version === DISCOVERY_PROTOCOL_VERSION &&
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
