import { PartialType } from '@nestjs/mapped-types';
import { CreateOtdrDto } from './create-otdr.dto';

export class UpdateOtdrDto extends PartialType(CreateOtdrDto) {}
