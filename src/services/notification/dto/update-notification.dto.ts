import { IsOptional, IsString } from 'class-validator';

export class UpdateNotificationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
