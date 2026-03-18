import { IsOptional, IsString, MinLength, IsNumber } from 'class-validator';

export class KeywordsDto {
  @IsString()
  @MinLength(5)
  content: string;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
