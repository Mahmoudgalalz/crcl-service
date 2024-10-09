import { IntersectionType } from '@nestjs/swagger';
import { UserStatus, UserType } from '@prisma/client';
import { IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/pagination-query-dto';

export class getUsersDtoBase {
  @IsOptional()
  status?: UserStatus;
  @IsOptional()
  gender?: 'Male' | 'Female';
  @IsOptional()
  types?: UserType[] | UserType;
}

export class getUsersDto extends IntersectionType(
  getUsersDtoBase,
  PaginationQueryDto,
) {}
