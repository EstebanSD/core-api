import { IntersectionType, OmitType, PartialType } from '@nestjs/mapped-types';
import { AddTranslationAboutDto } from './add-translation-about.dto';
import { CreateGeneralAboutDto } from './create-general-about.dto';

export class UpdateAboutDto extends IntersectionType(
  PartialType(CreateGeneralAboutDto),
  PartialType(OmitType(AddTranslationAboutDto, ['locale'] as const)),
) {}
