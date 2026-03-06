import { IsString } from 'class-validator';

export class SummaryStreamDto {
  @IsString()
  content: string;
}
