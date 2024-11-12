import {
  Controller,
  Res,
  HttpStatus,
  Req,
  Logger,
  Post,
  Body,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { CurrentUser } from 'src/shared/decorators/user.decorator';
import { User } from '@prisma/client';
import { PaymentDto } from './dto/payment.dto';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/interface/roles';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('listen')
  async listen(@Req() req: Request, @Res() res: Response) {
    try {
      const body = req.body;
      const action = await this.paymentService.paymentCallback(body);
      Logger.log(action);
      res.sendStatus(HttpStatus.OK);
    } catch (error) {
      Logger.log(error);
      res.sendStatus(HttpStatus.NOT_ACCEPTABLE);
    }
  }

  @Post('pay')
  @Roles(Role.User)
  async userPay(
    @CurrentUser() user: User,
    @Body() payload: PaymentDto,
    @Res() res: Response,
  ) {
    try {
      const action = await this.paymentService.initIntention(
        payload.ticketsIds,
        user.id,
        payload.callback,
      );
      res.status(HttpStatus.ACCEPTED).send({
        status: 'success',
        message: 'Payment Url',
        data: action,
      });
      return;
    } catch (error) {
      Logger.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        status: 'error',
        message: 'error happend in payment',
        error,
      });
      return;
    }
  }
}
