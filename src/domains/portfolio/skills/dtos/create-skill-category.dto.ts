import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateSkillCategoryDto {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
