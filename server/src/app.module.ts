import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OtdrModule } from './otdr/otdr.module';

@Module({
  imports: [OtdrModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
