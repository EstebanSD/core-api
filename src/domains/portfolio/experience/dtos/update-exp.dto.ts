import { IntersectionType, OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateExperienceGeneralDto } from './create-general-exp.dto';
import { AddExpTranslationDto } from './add-trans-exp.dto';

export class UpdateExperienceDto extends IntersectionType(
  PartialType(CreateExperienceGeneralDto),
  PartialType(OmitType(AddExpTranslationDto, ['locale'] as const)),
) {}
