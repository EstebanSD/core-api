import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LOCALE_ENUM, LocaleType } from 'src/types';

export class AddExpTranslationDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(LOCALE_ENUM)
  locale: LocaleType;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsOptional()
  @IsString()
  description?: string;
}
