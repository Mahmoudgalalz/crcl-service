import { IsBoolean, IsString } from 'class-validator';

export class ApplicationStatusDto {
  @IsBoolean()
  maintenance: boolean;

  @IsString()
  iosVersion: string;

  @IsString()
  androidVersion: string;
}
