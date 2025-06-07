import { IsOptional, IsEnum, IsString, IsIn } from 'class-validator';
import { LOCALE_ENUM, LocaleType } from 'src/types';
import { PROJECT_STATUSES, PROJECT_TYPES, ProjectStatus, ProjectType } from 'src/types/portfolio';

export class FindProjectsDto {
  @IsOptional()
  @IsString()
  @IsIn(LOCALE_ENUM)
  locale?: LocaleType;

  @IsOptional()
  @IsEnum(PROJECT_STATUSES)
  status?: ProjectStatus;

  @IsOptional()
  @IsEnum(PROJECT_TYPES)
  type?: ProjectType;
}
