import { IsOptional, IsInt, Min } from 'class-validator';

export class UpdateSkillCategoryDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
