import { IsString, IsOptional, IsEnum, IsEmail } from 'class-validator';
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
  facebook?: string;

  @IsString()
  @IsOptional()
  instagram?: string;
}
