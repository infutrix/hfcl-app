import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { CableTypeEnum, TestAt } from './run-skippy-metrics-with-image.dto';
import type { CableType } from './run-skippy-metrics-with-image.dto';

export class RunSkippyMetricsWithUploadedImageDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(120000)
  timeoutMs?: number;

  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsObject()
  @ValidateNested()
  @Type(() => TestAt)
  testAt: TestAt;

  @IsEnum(CableTypeEnum)
  cableType: CableType;
}
