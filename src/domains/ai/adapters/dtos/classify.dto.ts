import { IsArray, IsString, MinLength } from 'class-validator';

export class ClassifyDto {
  @IsString()
  @MinLength(5)
  content: string;

  @IsArray()
  @IsString({ each: true })
  categories: string[];
}
