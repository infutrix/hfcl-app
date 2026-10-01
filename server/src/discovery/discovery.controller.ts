import { Controller, Get } from '@nestjs/common';
import { MainServerDiscoveryService } from './main-server-discovery.service';
import { AiServerDiscoveryService } from './ai-server-discovery.service';

@Controller('discovery')
export class DiscoveryController {
  constructor(
    private readonly mainServerDiscovery: MainServerDiscoveryService,
    private readonly aiServerDiscovery: AiServerDiscoveryService,
  ) {}

  // The client's main-server-url.ts depends on this response shape. `url` is
  // the discovered URL or, when `fallback` is true, HFCL_MAIN_SERVER_FALLBACK_URL.
  @Get('main-server')
  getMainServer() {
    return {
      url: this.mainServerDiscovery.getMainServerUrl(),
      available: this.mainServerDiscovery.isMainServerAvailable(),
      fallback: this.mainServerDiscovery.isUsingFallback(),
      lastSeenAt: this.mainServerDiscovery.getLastSeenAt(),
    };
  }

  @Get('ai-server')
  getAiServer() {
    return this.aiServerDiscovery.getAiServerStatus();
  }

  @Get('status')
  getStatus() {
    return {
      mainServer: {
        available: this.mainServerDiscovery.isMainServerAvailable(),
        url: this.mainServerDiscovery.getMainServerUrl(),
        fallback: this.mainServerDiscovery.isUsingFallback(),
        lastSeenAt: this.mainServerDiscovery.getLastSeenAt(),
      },
      aiServer: this.aiServerDiscovery.getAiServerStatus(),
    };
  }
}
