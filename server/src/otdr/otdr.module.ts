import { Module } from '@nestjs/common';
import { OtdrService } from './otdr.service';
import { OtdrController } from './otdr.controller';

@Module({
  controllers: [OtdrController],
  providers: [OtdrService],
})
export class OtdrModule {}
