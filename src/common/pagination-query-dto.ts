import { IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDto {
  @IsPositive()
  @IsOptional()
  limit?: number = 10;

  @IsPositive()
  @IsOptional()
  page?: number = 1;
}
