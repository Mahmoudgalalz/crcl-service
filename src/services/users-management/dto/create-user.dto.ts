import { UserType } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserViaAdminDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  number: string;

  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  gender: 'Male' | 'Female';

  @IsNotEmpty()
  @IsString()
  type: UserType;
}
