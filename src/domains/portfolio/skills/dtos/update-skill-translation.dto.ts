import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSkillTransDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
