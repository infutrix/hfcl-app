import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AiServerDiscoveryService } from './ai-server-discovery.service';
import { AI_SERVER_FALLBACK_URL } from './ai-discovery.constants';

export interface AiServerRequestOptions extends RequestInit {
  path: string;
}

/**
 * Thin HTTP client for the FastAPI AI server. Never caches a baseURL: it
 * checks AiServerDiscoveryService on every call, since the AI server's LAN
 * IP can change (or it can go offline/restart) at any time.
 */
@Injectable()
export class AiServerApiService {
  private readonly logger = new Logger(AiServerApiService.name);

  constructor(private readonly discovery: AiServerDiscoveryService) {}

  private resolveUrl(path: string): string {
    if (!this.discovery.isAiServerAvailable()) {
      this.logger.warn(
        `No active AI server was found via UDP discovery; using fallback ${AI_SERVER_FALLBACK_URL}`,
      );
    }
    const baseUrl = this.discovery.getAiServerUrl();
    if (!baseUrl) {
      throw new ServiceUnavailableException(
        'AI Server is currently unavailable',
      );
    }
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
  }

  async request<T = unknown>({
    path,
    ...init
  }: AiServerRequestOptions): Promise<T> {
    const url = this.resolveUrl(path);

    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (error) {
      // Covers connection refused, DNS failure, and any network-level error
      // that can happen right after the AI server restarts or changes IP.
      const reason =
        error instanceof Error ? error.message : 'Unknown network error';
      this.logger.error(`AI server request to ${url} failed: ${reason}`);
      throw new ServiceUnavailableException(
        `AI Server is unreachable: ${reason}`,
      );
    }

    if (!response.ok) {
      this.logger.warn(
        `AI server request to ${url} failed with status ${response.status}`,
      );
      throw new Error(
        `AI server request to ${url} failed with status ${response.status}`,
      );
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      return (await response.json()) as T;
    }
    return (await response.text()) as unknown as T;
  }

  get<T = unknown>(path: string, init?: RequestInit): Promise<T> {
    return this.request<T>({ ...init, path, method: 'GET' });
  }

  post<T = unknown>(
    path: string,
    body?: unknown,
    init?: RequestInit,
  ): Promise<T> {
    return this.request<T>({
      ...init,
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }
}
