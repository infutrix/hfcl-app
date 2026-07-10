import { Type } from 'class-transformer';
import {
  IsBoolean,
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
export class RunSkippyLengthAndIorDto {
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

  @IsBoolean()
  @IsOptional()
  developerMode?: boolean;
}
