import { Controller, Get } from '@nestjs/common';
import { MainServerDiscoveryService } from './main-server-discovery.service';
import { AiServerDiscoveryService } from './ai-server-discovery.service';

@Controller('discovery')
export class DiscoveryController {
  constructor(
    private readonly mainServerDiscovery: MainServerDiscoveryService,
    private readonly aiServerDiscovery: AiServerDiscoveryService,
  ) {}

  // Existing contract — the client's main-server-url.ts already depends on
  // this exact response shape, so it is left unchanged.
  @Get('main-server')
  getMainServer() {
    return {
      url: this.mainServerDiscovery.getMainServerUrl(),
      available: this.mainServerDiscovery.isMainServerAvailable(),
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
        lastSeenAt: this.mainServerDiscovery.getLastSeenAt(),
      },
      aiServer: this.aiServerDiscovery.getAiServerStatus(),
    };
  }
}
