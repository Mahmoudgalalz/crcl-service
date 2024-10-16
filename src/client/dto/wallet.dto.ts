import { IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class walletBoothTransactionDTO {
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

export class TicketsTransactionDTO {
  @IsArray()
  @IsNotEmpty()
  ticketsIds: string[];
}
