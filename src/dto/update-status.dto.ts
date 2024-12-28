import { IsBoolean } from 'class-validator';

export class ApplicationStatusDto {
  @IsBoolean()
  maintenance: boolean;
}
