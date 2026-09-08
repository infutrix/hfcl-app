import { Global, Module } from '@nestjs/common';
import { MainServerDiscoveryService } from './main-server-discovery.service';
import { MainServerApiService } from './main-server-api.service';
import { AiServerDiscoveryService } from './ai-server-discovery.service';
import { AiServerApiService } from './ai-server-api.service';
import { DiscoveryController } from './discovery.controller';

/**
 * Global so the UDP listeners are bound exactly once per process, and any
 * module in the app can inject the discovery/API services without
 * re-importing this module. Main server and AI server discovery run as
 * fully independent providers (separate sockets, ports, secrets, state).
 */
@Global()
@Module({
  controllers: [DiscoveryController],
  providers: [
    MainServerDiscoveryService,
    MainServerApiService,
    AiServerDiscoveryService,
    AiServerApiService,
  ],
  exports: [
    MainServerDiscoveryService,
    MainServerApiService,
    AiServerDiscoveryService,
    AiServerApiService,
  ],
})
export class DiscoveryModule {}
