/* eslint-disable prettier/prettier */
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSuperUserViaAdminDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()  // Ensure the name is not empty
  name: string;

  @IsString()
  @MinLength(8, {
    message: 'password must not be less than 8 characters',
  })
  @MaxLength(32, {
    message: 'password must not be more than 32 characters',
  })
  password: string;
}
