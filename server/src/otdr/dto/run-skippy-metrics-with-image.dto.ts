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

export const CableType = ['IBR', 'MULTI_TUBE', 'FLAT_RIBBON'] as const;
export type CableType = (typeof CableType)[number];
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

  @IsEnum(CableType)
  cableType: CableType;

  @IsBoolean()
  @IsOptional()
  developerMode?: boolean;
}
