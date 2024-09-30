import { IsEmail, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateSuperUserViaAdminDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  name: string;

  @IsString()
  @Min(8)
  @Max(32)
  password: string;
}
