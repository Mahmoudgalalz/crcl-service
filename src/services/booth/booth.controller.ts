import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { BoothManagementService } from './booth.services';
import { walletBoothTransactionDTO } from 'src/client/dto/wallet.dto';
import { SuccessResponse } from 'src/common/success.response';

@Controller('booth')
export class BoothController {
  constructor(private readonly boothServices: BoothManagementService) {}

  @Get()
  async getAllBooth() {
    try {
      const booths = await this.boothServices.boothAccounts();
      return new SuccessResponse('All Booths', booths);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/withdraw')
  async withdrawTransaction(
    @Param('id') boothId: string,
    @Body() data: walletBoothTransactionDTO,
  ) {
    try {
      const initBoothTransaction = await this.boothServices.withdrawMoney(
        boothId,
        data.amount,
      );
      return new SuccessResponse('Transactions details', initBoothTransaction);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async GetBoothTransactions(@Param('id') boothId: string) {
    try {
      const boothTransactions =
        await this.boothServices.readTransactions(boothId);
      const tokenPrice = await this.boothServices.tokenPrice;
      return new SuccessResponse('Transactions for booth', {
        boothTransactions,
        tokenPrice,
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
