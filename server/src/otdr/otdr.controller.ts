import { Body, Controller, Get, Post } from '@nestjs/common';
import { OtdrService } from './otdr.service';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { SendSkippyCommandDto } from './dto/send-skippy-command.dto';
import { RunSkippyMetricsWithImageDto } from './dto/run-skippy-metrics-with-image.dto';
import { RunSkippyLengthAndIorDto } from './dto/run-skippy-length-and-ior.dto';

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
}
