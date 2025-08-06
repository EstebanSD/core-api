import { PartialType } from '@nestjs/mapped-types';
import { CreateGeneralAboutDto } from './create-general-about.dto';

export class UpdateGeneralAboutDto extends PartialType(CreateGeneralAboutDto) {}
