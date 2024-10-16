import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpadteUserViaAdminDto {
  @IsNotEmpty()
  @IsString()
  status: 'ACTIVE' | 'BLOCKED';
}

export class TopUpDto {
  @IsNumber()
  @Min(1)
  @Max(1000)
  @IsOptional()
  top?: number;

  @IsNumber()
  @Min(1)
  @Max(1000)
  @IsOptional()
  down?: number;
}
