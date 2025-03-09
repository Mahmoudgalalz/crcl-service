import {
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  MaxLength,
  MinLength,
  IsPhoneNumber,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class UserUpdateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  picture?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(8, {
    message: 'password must not be less than 8 characters',
  })
  @MaxLength(32, {
    message: 'password must not be more than 32 characters',
  })
  password?: string;

  @IsString()
  @IsOptional()
  facebook?: string;

  @IsPhoneNumber()
  @IsOptional()
  number?: string;

  @IsString()
  @IsOptional()
  instagram?: string;

  @IsString()
  @IsOptional()
  notificationToken?: string;
}
