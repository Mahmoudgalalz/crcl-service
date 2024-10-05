import { IsString, IsOptional, IsEnum } from 'class-validator';
import { NewsStatus } from '@prisma/client';

export class CreateNewspaperDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsEnum(NewsStatus)
  status: NewsStatus;
}

export class UpdateNewspaperDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;
}
