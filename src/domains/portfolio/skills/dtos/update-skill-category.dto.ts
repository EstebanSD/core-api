import { IsInt, Min } from 'class-validator';

export class UpdateSkillCategoryDto {
  @IsInt()
  @Min(0)
  order: number;
}
