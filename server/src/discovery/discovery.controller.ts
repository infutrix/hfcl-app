import { Controller, Get } from '@nestjs/common';
import { MainServerDiscoveryService } from './main-server-discovery.service';

@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly discovery: MainServerDiscoveryService) {}

  @Get('main-server')
  getMainServer() {
    return {
      url: this.discovery.getMainServerUrl(),
      available: this.discovery.isMainServerAvailable(),
      lastSeenAt: this.discovery.getLastSeenAt(),
    };
  }
}
