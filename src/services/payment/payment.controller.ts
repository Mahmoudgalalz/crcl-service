import {
  Controller,
  Res,
  HttpStatus,
  Req,
  Logger,
  Post,
  Body,
  Get,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { CurrentUser } from 'src/shared/decorators/user.decorator';
import { User } from '@prisma/client';
import { PaymentDto } from './dto/payment.dto';
import { Public, Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/interface/roles';
import { TicketEmailProps } from '../email/types/email.type';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('listen')
  @Public()
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

  @Get('usd')
  @Public()
  async usdPrice(@Req() req: Request, @Res() res: Response) {
    try {
      const price = await this.paymentService.usdPrice();
      res.status(HttpStatus.ACCEPTED).send({
        status: 'success',
        message: 'Taxes and usd price',
        data: {
          usd: price.usd_price,
          tax_per_ticket: process.env.TAXES
            ? parseFloat(process.env.TAXES)
            : 2.5,
          egp_tax:
            (process.env.TAXES ? parseFloat(process.env.TAXES) : 2.5) *
            price.usd_price,
        },
      });
      return;
    } catch (error) {
      Logger.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        status: 'error',
        message: 'error happend in getting usd price',
        error,
      });
      return;
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

  @Post('test')
  @Public()
  async test() {
    const ticketEmailData: TicketEmailProps = {
      recipientName: 'John Doe',
      eventName: 'Tech Conference 2024',
      eventImage: 'https://example.com/event-image.jpg', // Replace with your actual URL
      ticketDetails: {
        id: 'TCK12345',
        date: '2024-12-15',
        type: 'VIP',
        time: '10:00 AM',
        qrCodeSVG: `
          <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
            <rect width="200" height="200" fill="white"/>
            <path d="M20 20h40v40H20V20zm60 0h20v20H80V20zM20 80h20v20H20V80zm60 40h20v20H80v-20zm40-20h40v40h-40v-40zm-80 60h20v20H20v-20zm80 0h20v20h-20v-20zm40-80h20v20h-20V60zm-40 40h20v20h-20v-20z" fill="black"/>
          </svg>
        `, // Replace with actual QR SVG data
      },
    };
    this.paymentService.test('ssss.aaa2002@gmail.com', ticketEmailData);
  }
}
