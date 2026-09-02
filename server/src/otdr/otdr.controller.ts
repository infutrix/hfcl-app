import {
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
import { RunSkippyLengthAndIorDto } from './dto/run-skippy-length-and-ior.dto';
import { RunSkippyMetricsWithUploadedImageDto } from './dto/run-skippy-metrics-with-uploaded-image.dto';

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

  @Post('commands/skippy/length-and-ior')
  runSkippyLengthAndIor(
    @Body() runSkippyLengthAndIorDto: RunSkippyLengthAndIorDto,
  ) {
    return this.otdrService.runSkippyLengthAndIor(runSkippyLengthAndIorDto);
  }

  @Post('commands/skippy/metrics-with-image')
  runSkippyMetricsWithImage(
    @Body() runSkippyMetricsWithImageDto: RunSkippyMetricsWithImageDto,
  ) {
    return this.otdrService.runSkippyMetricsWithImage(
      runSkippyMetricsWithImageDto,
    );
  }

  /**
   * Developer-mode-only: lets a client upload its own image (no camera
   * server required) and still runs it through the real AI prediction
   * server instead of returning hardcoded dummy data.
   */
  @Post('commands/skippy/metrics-with-image/upload')
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: 200 * 1024 * 1024 } }), // 200 MB
  )
  runSkippyMetricsWithUploadedImage(
    @UploadedFile() image: Express.Multer.File,
    @Body()
    runSkippyMetricsWithUploadedImageDto: RunSkippyMetricsWithUploadedImageDto,
  ) {
    return this.otdrService.runSkippyMetricsWithUploadedImage(
      image,
      runSkippyMetricsWithUploadedImageDto,
    );
  }
}
