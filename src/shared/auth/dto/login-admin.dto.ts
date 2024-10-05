import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginAdminDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsString()
  @MinLength(8, {
    message: 'password must not be less than 8 characters',
  })
  @MaxLength(32, {
    message: 'password must not be more than 32 characters',
  })
  password: string;
}
