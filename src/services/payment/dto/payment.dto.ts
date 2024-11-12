import { IsString, IsArray, IsNotEmpty } from 'class-validator';

export class PaymentDto {
  @IsNotEmpty()
  @IsString()
  callback: string;

  @IsArray()
  ticketsIds: string[];
}
