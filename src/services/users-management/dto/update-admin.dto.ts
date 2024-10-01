import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateSuperUserViaAdminDto {
  @IsString()
  name: string;

  @IsString()
  @MinLength(8, {
    message: 'password must not be less than 8 characters',
  })
  @MaxLength(32, {
    message: 'password must not be more than 32 characters',
  })
  password?: string;
}
