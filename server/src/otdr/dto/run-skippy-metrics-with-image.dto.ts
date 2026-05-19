import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

class TestAt {
  @IsBoolean()
  '1310': boolean;

  @IsBoolean()
  '1550': boolean;

  @IsBoolean()
  '1625': boolean;
}
export class RunSkippyMetricsWithImageDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(120000)
  timeoutMs?: number;

  @Type(() => TestAt)
  testAt: TestAt;

  @IsBoolean()
  @IsOptional()
  developerMode?: boolean;
}
