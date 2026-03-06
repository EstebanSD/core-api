import { IsString } from 'class-validator';

export class ClassifyStreamDto {
  @IsString()
  content: string;

  @IsString()
  categories: string;
}
