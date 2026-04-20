import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OtdrService } from './otdr.service';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { SendSkippyCommandDto } from './dto/send-skippy-command.dto';
import { RunSkippyMetricsWithImageDto } from './dto/run-skippy-metrics-with-image.dto';

interface UploadedImageFile {
  fieldname: string;
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller('otdr')
export class OtdrController {
  constructor(private readonly otdrService: OtdrService) {}

  @Post('connection')
  connection(@Body() createConnectionDto: CreateConnectionDto) {
    return this.otdrService.connection(createConnectionDto);
  }

  @Get('connection/status')
  status() {
    return this.otdrService.getConnectionStatus();
  }

  @Post('commands/skippy')
  sendSkippyCommand(@Body() sendSkippyCommandDto: SendSkippyCommandDto) {
    return this.otdrService.sendSkippyCommand(sendSkippyCommandDto);
  }

  @Post('commands/skippy/metrics-with-image')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 500 * 1024 * 1024, // 500MB
      },
    }),
  )
  runSkippyMetricsWithImage(
    @UploadedFile() image: UploadedImageFile | undefined,
    @Body() runSkippyMetricsWithImageDto: RunSkippyMetricsWithImageDto,
  ) {
    if (!image) {
      throw new BadRequestException('Image file is required in field "image".');
    }

    return this.otdrService.runSkippyMetricsWithImage(
      image,
      runSkippyMetricsWithImageDto.timeoutMs,
    );
  }
}
