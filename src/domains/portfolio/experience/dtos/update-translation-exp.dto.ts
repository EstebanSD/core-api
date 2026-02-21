import { OmitType, PartialType } from '@nestjs/mapped-types';
import { AddExpTranslationDto } from './add-trans-exp.dto';

export class UpdateExperienceTranslationDto extends PartialType(
  OmitType(AddExpTranslationDto, ['locale'] as const),
) {}
