import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';

export class SocialLinksDto {
  @IsOptional()
  @IsUrl()
  github?: string;

  @IsOptional()
  @IsUrl()
  linkedin?: string;
}

export class CreateAboutDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['en', 'es'])
  locale: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  bio: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;
}
