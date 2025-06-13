import { IntersectionType, OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateProjectGeneralDto } from './create-project-general.dto';
import { AddProjectTranslationDto } from './add-translation.dto';

export class UpdateProjectDto extends IntersectionType(
  PartialType(CreateProjectGeneralDto),
  PartialType(OmitType(AddProjectTranslationDto, ['locale'] as const)),
) {}
