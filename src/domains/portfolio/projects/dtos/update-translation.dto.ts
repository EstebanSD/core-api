import { OmitType, PartialType } from '@nestjs/mapped-types';
import { AddProjectTranslationDto } from './add-translation.dto';

export class UpdateTranslationDto extends PartialType(
  OmitType(AddProjectTranslationDto, ['locale'] as const),
) {}
