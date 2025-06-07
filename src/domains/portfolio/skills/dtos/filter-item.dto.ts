import { IsOptional, IsString } from 'class-validator';

export class FilterItemDto {
  @IsOptional()
  @IsString()
  name?: string;
}
