import { SuperUserType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateSuperUserViaAdminDto {
  @Transform(({ value }) => value.toLowerCase())
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  name: string;

  @IsString()
  @MinLength(8, {
    message: 'password must not be less than 8 characters',
  })
  @MaxLength(32, {
    message: 'password must not be more than 32 characters',
  })
  password: string;

  @IsEnum(SuperUserType)
  @IsNotEmpty()
  type: SuperUserType;
}
