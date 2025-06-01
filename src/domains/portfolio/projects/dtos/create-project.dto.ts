import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TECH_STACK, TechStack } from 'src/types';
import { PROJECT_STATUSES, PROJECT_TYPES, ProjectStatus, ProjectType } from 'src/types/portfolio';

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
  locale: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(PROJECT_STATUSES)
  status: ProjectStatus;

  @IsEnum(PROJECT_TYPES)
  type: ProjectType;

  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsArray()
  @IsEnum(TECH_STACK, { each: true })
  technologies?: TechStack[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectLinksDto)
  links?: ProjectLinksDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
