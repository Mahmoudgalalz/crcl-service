import {
  IsString,
  IsOptional,
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsJSON,
} from 'class-validator';
import { EventStatus, RequestStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsOptional()
  @IsString()
  time: string;

  @IsEnum(EventStatus)
  status: EventStatus;

  @IsObject()
  coordinates: { lat: number; lng: number };

  @IsInt()
  capacity: number;

  @IsArray()
  @IsString({ each: true })
  artists: string[];

  @IsString()
  createdBy: string;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsOptional()
  @IsInt()
  capacity?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  artists?: string[];
}

export class ChangeRequestDto {
  @IsNotEmpty()
  @IsEnum(RequestStatus)
  status: RequestStatus;

  @IsNotEmpty()
  @IsString()
  userId: string;
}
