import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { LOCALE_ENUM, LocaleType } from 'src/types';

export class AddSkillTranslationDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(LOCALE_ENUM)
  locale: LocaleType;

  @IsNotEmpty()
  @IsString()
  name: string;
}
