import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { LOCALE_ENUM, LocaleType } from 'src/types';

export class AddProjectTranslationDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(LOCALE_ENUM)
  locale: LocaleType;

  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
