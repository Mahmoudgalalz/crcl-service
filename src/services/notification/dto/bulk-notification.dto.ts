import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class BulkPushNotifiaction {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsArray()
  @IsOptional()
  userIds?: string[];

  @IsString()
  @IsOptional()
  notificationId?: string;

  @IsBoolean()
  @IsOptional()
  all?: boolean;
}

export class PushNotifiaction {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}
