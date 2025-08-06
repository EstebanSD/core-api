import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { AddTranslationAboutDto } from './add-translation-about.dto';
import { LOCALE_ENUM, LocaleType } from 'src/types';

export class UpdateTranslationAboutDto extends PartialType(AddTranslationAboutDto) {
  @IsString()
  @IsNotEmpty()
  @IsIn(LOCALE_ENUM)
  locale: LocaleType;
}
