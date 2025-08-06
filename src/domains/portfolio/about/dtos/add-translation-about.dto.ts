import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LOCALE_ENUM, LocaleType } from 'src/types';

export class AddTranslationAboutDto {
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
}
