import { Transform, Type } from 'class-transformer';
import { IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { parseJsonArray } from 'src/common/helpers';
import { LOCALE_ENUM, LocaleType } from 'src/types';

export class CreateAboutDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(LOCALE_ENUM)
  locale: LocaleType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  bio: string;

  @IsOptional()
  @IsString()
  tagline?: string;

  // General //
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  birthYear?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => parseJsonArray(value))
  positioningTags?: string[];
}
