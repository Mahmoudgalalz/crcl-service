import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateSuperUserViaAdminDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  name: string;

  @IsString()
  password: string;
}
