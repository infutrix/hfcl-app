import { Global, Module } from '@nestjs/common';
import { MainServerDiscoveryService } from './main-server-discovery.service';
import { MainServerApiService } from './main-server-api.service';
import { DiscoveryController } from './discovery.controller';

/**
 * Global so the UDP listener is bound exactly once per process, and any
 * module in the app can inject MainServerDiscoveryService/MainServerApiService
 * without re-importing this module.
 */
@Global()
@Module({
  controllers: [DiscoveryController],
  providers: [MainServerDiscoveryService, MainServerApiService],
  exports: [MainServerDiscoveryService, MainServerApiService],
})
export class DiscoveryModule {}
