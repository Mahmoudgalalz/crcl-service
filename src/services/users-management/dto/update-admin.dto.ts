import { IsString, Max, Min } from 'class-validator';

export class UpdateSuperUserViaAdminDto {
  @IsString()
  name: string;

  @IsString()
  @Min(8)
  @Max(32)
  password?: string;
}
