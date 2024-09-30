import { IsNotEmpty, IsString } from 'class-validator';

export class UpadteUserViaAdminDto {
  @IsNotEmpty()
  @IsString()
  type: 'ACTIVE' | 'BLOCKED';
}
