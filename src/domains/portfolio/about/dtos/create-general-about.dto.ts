import { Transform, Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { parseJsonArray } from 'src/common/helpers';

export class CreateGeneralAboutDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  birthYear?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => parseJsonArray(value))
  positioningTags?: string[];
}
