import { IsNotEmpty, IsNumber, IsArray, IsString } from 'class-validator';

export class walletBoothTransactionDTO {
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

export class TicketsTransactionDTO {
  @IsArray()
  @IsNotEmpty()
  ticketsIds: string[];

  @IsNotEmpty()
  @IsString()
  callback: string;
}
