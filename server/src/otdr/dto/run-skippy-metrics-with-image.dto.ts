import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

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

  @IsObject()
  @ValidateNested()
  @Type(() => TestAt)
  testAt: TestAt;

  @IsEnum(['IBR', 'MULTI_TUBE', 'FLAT_RIBBON'])
  cableType: 'IBR' | 'MULTI_TUBE' | 'FLAT_RIBBON';

  @IsBoolean()
  @IsOptional()
  developerMode?: boolean;
}
