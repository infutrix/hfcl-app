import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OtdrModule } from './otdr/otdr.module';
import { DiscoveryModule } from './discovery/discovery.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DiscoveryModule,
    OtdrModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
