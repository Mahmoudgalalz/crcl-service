import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class AnalyticsQueryDto {
  @IsOptional()
  @IsBoolean()
  totalMoney?: boolean;

  @IsOptional()
  @IsBoolean()
  eventStats?: boolean;

  @IsOptional()
  @IsBoolean()
  eventRequestCounts?: boolean;

  @IsOptional()
  @IsBoolean()
  totalPaidTickets?: boolean;

  @IsOptional()
  @IsBoolean()
  userRequestCounts?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  all?: boolean;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
