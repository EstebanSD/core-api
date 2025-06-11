import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&()[\]{}])[A-Za-z\d@$!%*?&()[\]{}]{8,}$/;

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, ' +
      'a number, and a special character.',
  })
  password: string;

  @IsOptional()
  @IsString()
  fullName?: string;
}
