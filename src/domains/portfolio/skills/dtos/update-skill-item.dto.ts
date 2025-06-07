import { IsOptional, IsString } from 'class-validator';

export class UpdateSkillItemDto {
  @IsOptional()
  @IsString()
  name?: string;
}
