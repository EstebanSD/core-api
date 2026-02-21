import { PartialType } from '@nestjs/mapped-types';
import { CreateExperienceGeneralDto } from './create-general-exp.dto';

export class UpdateExperienceGeneralDto extends PartialType(CreateExperienceGeneralDto) {}
