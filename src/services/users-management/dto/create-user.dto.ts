/* eslint-disable prettier/prettier */
import { UserType } from '@prisma/client';
import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserViaAdminDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber()
  number: string;

  @IsString()
  @MinLength(8, {
    message: 'password must not be less than 8 characters',
  })
  @MaxLength(32, {
    message: 'password must not be more than 32 characters',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  gender: 'Male' | 'Female';

  @IsNotEmpty()
  @IsString()
  type: UserType;
}
