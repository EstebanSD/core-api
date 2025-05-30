import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateAboutDto } from './create-about.dto';

export class UpdateAboutDto extends PartialType(OmitType(CreateAboutDto, ['locale'] as const)) {}
