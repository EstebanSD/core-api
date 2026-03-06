import { IsString, MinLength } from 'class-validator';

export class SeoMetaDto {
  @IsString()
  @MinLength(10)
  content: string;
}
