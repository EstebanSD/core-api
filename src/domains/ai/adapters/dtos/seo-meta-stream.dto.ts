import { IsString } from 'class-validator';

export class SeoMetaStreamDto {
  @IsString()
  content: string;
}
