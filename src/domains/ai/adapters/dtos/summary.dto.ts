import { IsString, MinLength } from 'class-validator';

export class SummaryDto {
  @IsString()
  @MinLength(10)
  content: string;
}
