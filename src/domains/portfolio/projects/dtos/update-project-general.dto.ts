import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectGeneralDto } from './create-project-general.dto';

export class UpdateProjectGeneralDto extends PartialType(CreateProjectGeneralDto) {}
