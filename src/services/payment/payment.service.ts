import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import axios from 'axios';
import { PAYMENT_WEBHOOK_URL, PUBLIC_PAYMENT_URL } from 'src/shared/constants';
import { PaymentStatus } from '@prisma/client';
import { newId } from 'src/common/uniqueId.utils';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async initIntention(ticketsIds: string[], userId: string, callback: string) {
    const payload = await this.formatPaymentData(userId, ticketsIds, callback);
    if (payload) {
      const request = await axios.post(
        'https://accept.paymob.com/v1/intention/',
        payload,
        {
          headers: {
            Authorization: `Token ${process.env.PAYMENT_SECRET_KEY}`,
          },
        },
      );
      if (request.status === 201) {
        const { client_secret } = request.data;
        const paymentUrl = `${PUBLIC_PAYMENT_URL}?publicKey=${process.env.PAYMENT_PUBLIC_KEY}&clientSecret=${client_secret}`;
        return paymentUrl;
      } else {
        throw Error('Error in payment gateway');
      }
    }
  }

  private async formatPaymentData(
    userId: string,
    ticketsIds: string[],
    callback: string,
  ) {
    const ticketsUsersInfo = await this.prisma.ticketPurchase.findMany({
      where: {
        userId: userId,
        id: {
          in: ticketsIds,
        },
      },
      include: {
        user: true,
        ticket: {
          select: {
            price: true,
          },
        },
      },
    });

    if (ticketsIds.length === 0) {
      return null;
    }
    const prices = await this.prisma.walletToken.findFirst();
    const taxPerTicket = process.env.TAXES
      ? parseFloat(process.env.TAXES)
      : 2.5 * prices.usd_price;
    // Calculate the total amount
    const amount = ticketsUsersInfo.reduce(
      (sum, purchase) => sum + (purchase.ticket.price + taxPerTicket || 0),
      0,
    );

    const user = ticketsUsersInfo[0].user;
    const data = {
      amount: amount * 100, // paymob takes amount in piastre
      currency: 'EGP',
      payment_methods: ['card', 'wallet'],
      billing_data: {
        first_name: user.name,
        last_name: '-',
        phone_number: user.number,
        email: user.email,
      },
      extras: {
        userId: user.id,
        ticketsIds,
      },
      special_reference: newId('transaction', 14),
      notification_url: PAYMENT_WEBHOOK_URL,
      redirection_url: callback,
    };

    return data;
  }
  async paymentCallback(body: any) {
    const { id, success, payment_key_claims } = body.obj;
    const { userId, ticketsIds } = payment_key_claims.extra;

    const status = success ? PaymentStatus.PAID : PaymentStatus.UN_PAID;
    try {
      const res = await this.updateTicketStatus(userId, ticketsIds, id, status);
      return { res, id, success, payment_key_claims };
    } catch (error) {
      return false;
    }
  }
  async usdPrice() {
    return await this.prisma.walletToken.findFirst({
      where: {
        usd_price: {
          not: null,
        },
      },
    });
  }

  private async updateTicketStatus(
    userId: string,
    ticketsIds: string[],
    paymentReference: number,
    status: PaymentStatus,
  ) {
    try {
      const paid: Record<string, any> = {};
      await this.prisma.$transaction(async (prisma) => {
        for (const ticketId of ticketsIds) {
          const existingTicket = await prisma.ticketPurchase.findFirst({
            where: {
              userId,
              id: ticketId,
            },
          });

          if (!existingTicket) {
            throw new Error(
              `Ticket with id ${ticketId} for user ${userId} not found`,
            );
          }

          const ticket = await prisma.ticketPurchase.update({
            where: {
              id: ticketId,
            },
            data: {
              payment: status,
              paymentReference: paymentReference.toString(),
            },
          });

          paid[ticketId] = ticket;
        }
      });
      return paid;
    } catch (error) {
      Logger.error(error);
    }
  }
}
