import { IsString } from 'class-validator';

export class UpdateSuperUserViaAdminDto {
  @IsString()
  name: string;

  @IsString()
  password?: string;
}
