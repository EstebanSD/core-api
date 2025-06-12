import { IsIn, IsOptional, IsString } from 'class-validator';
import { LOCALE_ENUM, LocaleType } from 'src/types';
import { EXPERIENCE_TYPE_ENUM, ExperienceType } from 'src/types/portfolio';

export class FindExperiencesDto {
  @IsOptional()
  @IsString()
  @IsIn(LOCALE_ENUM)
  locale?: LocaleType;

  @IsOptional()
  @IsString()
  position?: string;

  //  GENERAL
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  @IsIn(EXPERIENCE_TYPE_ENUM)
  type?: ExperienceType;
}
