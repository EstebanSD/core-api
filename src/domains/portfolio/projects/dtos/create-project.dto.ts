import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsArray,
  IsUrl,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { LOCALE_ENUM, LocaleType } from 'src/types';
import { PROJECT_STATUSES, PROJECT_TYPES, ProjectStatus, ProjectType } from 'src/types/portfolio';
import { parseJsonArray } from 'src/common/helpers';

class ProjectLinksDto {
  @IsOptional()
  @IsUrl()
  github?: string;

  @IsOptional()
  @IsUrl()
  website?: string;
}

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(LOCALE_ENUM)
  locale: LocaleType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(PROJECT_STATUSES)
  status: ProjectStatus;

  @IsString()
  @IsNotEmpty()
  @IsIn(PROJECT_TYPES)
  type: ProjectType;

  @IsDateString()
  startDate: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => parseJsonArray(value))
  technologies?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectLinksDto)
  links?: ProjectLinksDto;
}
