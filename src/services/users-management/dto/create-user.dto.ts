import { UserType } from '@prisma/client';
import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Max,
  Min,
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
  @Min(8)
  @Max(32)
  password: string;

  @IsNotEmpty()
  @IsString()
  gender: 'Male' | 'Female';

  @IsNotEmpty()
  @IsString()
  type: UserType;
}
