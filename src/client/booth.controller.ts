import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { SuccessResponse } from 'src/common/success.response';
import { Role } from 'src/shared/interface/roles';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserService } from './user.service';
import { CurrentUser } from 'src/shared/decorators/user.decorator';
import { User } from '@prisma/client';
import { walletBoothTransactionDTO } from './dto/wallet.dto';

@Controller('client/booth')
@Roles(Role.Booth)
export class BoothController {
  constructor(private readonly userService: UserService) {}

  @Post('transactions')
  async initTransactions(
    @CurrentUser() user: User,
    @Body() data: walletBoothTransactionDTO,
  ) {
    try {
      Logger.log(user);
      const initBoothTransaction = await this.userService.BoothInitTransaction(
        user.id,
        data.amount,
      );
      return new SuccessResponse('Transactions details', initBoothTransaction);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('wallet')
  @Roles(Role.Booth)
  async walletInfo(@CurrentUser() user: User) {
    try {
      const transactions = await this.userService.UserWallet(user.id);
      return new SuccessResponse('Booth Transactions', transactions);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
