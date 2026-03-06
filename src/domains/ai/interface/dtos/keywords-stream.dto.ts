import { IsOptional, IsString } from 'class-validator';

export class KeywordsStreamDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
