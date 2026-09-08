import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { MainServerDiscoveryService } from './main-server-discovery.service';

export interface MainServerRequestOptions extends RequestInit {
  path: string;
}

/**
 * Thin HTTP client for talking to hfcl-api. Never caches a baseURL: it asks
 * MainServerDiscoveryService for the current address on every call, since
 * the main server's LAN IP can change at any time via DHCP.
 */
@Injectable()
export class MainServerApiService {
  private readonly logger = new Logger(MainServerApiService.name);

  constructor(private readonly discovery: MainServerDiscoveryService) {}

  private resolveUrl(path: string): string {
    const baseUrl = this.discovery.getMainServerUrl();
    if (!baseUrl) {
      throw new ServiceUnavailableException(
        'Main server has not been discovered on the local network yet.',
      );
    }
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
  }

  async request<T = unknown>({ path, ...init }: MainServerRequestOptions): Promise<T> {
    const url = this.resolveUrl(path);
    const response = await fetch(url, init);

    if (!response.ok) {
      this.logger.warn(`Request to ${url} failed with status ${response.status}`);
      throw new Error(`Main server request to ${url} failed with status ${response.status}`);
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

  post<T = unknown>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    return this.request<T>({
      ...init,
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }
}
