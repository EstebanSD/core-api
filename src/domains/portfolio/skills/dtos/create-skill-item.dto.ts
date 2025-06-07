import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSkillItemDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
