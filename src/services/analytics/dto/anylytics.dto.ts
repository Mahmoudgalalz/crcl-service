import { IsBoolean, IsOptional, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

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
  all?: boolean;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : null))
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : null))
  endDate?: Date;
}
