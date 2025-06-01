import { IsOptional, IsEnum, IsString } from 'class-validator';
import { PROJECT_STATUSES, PROJECT_TYPES, ProjectStatus, ProjectType } from 'src/types/portfolio';

export class FindProjectsDto {
  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsEnum(PROJECT_STATUSES)
  status?: ProjectStatus;

  @IsOptional()
  @IsEnum(PROJECT_TYPES)
  type?: ProjectType;
}
