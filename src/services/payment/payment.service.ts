import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import axios from 'axios';
import { PAYMENT_WEBHOOK_URL, PUBLIC_PAYMENT_URL } from 'src/shared/constants';
import { PaymentStatus } from '@prisma/client';
import { newId } from 'src/common/uniqueId.utils';
import { TicketEmailProps } from '../email/types/email.type';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SendTicketEmailEvent } from '../email/events/sendTicket.event';
import { format } from 'date-fns';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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
        Logger.log(payload);
        throw Error('Error in payment gateway');
      }
    }
  }

  async paymentCallback(body: any) {
    const { id, success, payment_key_claims } = body.obj;
    const { userId, ticketsIds, invitationId } = payment_key_claims.extra;
    const status = success ? PaymentStatus.PAID : PaymentStatus.UN_PAID;

    try {
      if (invitationId) {
        const res = await this.updateInvitationStatus(invitationId, status);
        return { res, id, success, payment_key_claims };
      } else {
        const res = await this.updateTicketStatus(
          userId,
          ticketsIds,
          id,
          status,
        );
        return { res, id, success, payment_key_claims };
      }
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

  private async formatPaymentData(
    userId: string,
    ticketsIds: string[],
    callback: string,
  ) {
    if (!ticketsIds || ticketsIds.length === 0) {
      throw new Error('No ticket IDs provided.');
    }

    // Fetch ticket purchase information
    const ticketsUsersInfo = await this.prisma.ticketPurchase.findMany({
      where: {
        userId,
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

    if (!ticketsUsersInfo || ticketsUsersInfo.length === 0) {
      throw new Error('No tickets found for the provided IDs.');
    }

    // Fetch wallet token prices
    const prices = await this.prisma.walletToken.findFirst();
    if (!prices || !prices.usd_price) {
      throw new Error('Unable to fetch wallet token prices.');
    }

    // Calculate taxes
    const usdPrice = prices.usd_price;
    const taxRate = parseFloat(process.env.TAXES || '2.5'); // Default to 2.5 if TAXES is not set
    const taxPerTicket = taxRate * usdPrice;

    // Calculate the total amount
    const amount = ticketsUsersInfo.reduce(
      (sum, purchase) => sum + (purchase.ticket.price + taxPerTicket || 0),
      0,
    );

    // Ensure user information is available
    const user = ticketsUsersInfo[0].user;
    if (!user) {
      throw new Error('User information is missing for the ticket purchase.');
    }

    // Convert amount to piastres (rounded integer)
    const amountInPiastres = Math.round(amount * 100);
    const payment_methods = process.env.PAYMENT_METHODS.replace(' ', '').split(
      ',',
    );
    // Prepare payment data
    const data = {
      amount: amountInPiastres, // Paymob expects amount in piastres
      currency: 'EGP',
      payment_methods: payment_methods ? payment_methods : ['card', 'wallet'],
      billing_data: {
        first_name: user.name || 'Unknown',
        last_name: '-',
        phone_number: user.number || 'N/A',
        email: user.email || 'N/A',
      },
      extras: {
        userId: user.id,
        ticketsIds,
        invitationId: null,
      },
      special_reference: newId('transaction', 14),
      notification_url: PAYMENT_WEBHOOK_URL,
      redirection_url: callback,
    };

    return data;
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
            include: {
              ticket: {
                include: {
                  event: true,
                },
              },
            },
            data: {
              payment: status,
              paymentReference: paymentReference.toString(),
            },
          });

          if (status === 'PAID') {
            const timeString = ticket.ticket.event.time;
            const date = new Date(`2024-12-25T${timeString}:00`);
            const formattedTime = format(date, 'hh:mm a');
            const data: TicketEmailProps = {
              recipientName: ticket.meta['name'],
              eventName: ticket.ticket.event.title,
              eventImage: ticket.ticket.event.image,
              ticketDetails: {
                id: ticket.id,
                date: format(ticket.ticket.event.date, 'MMMM dd, yyyy'),
                type: ticket.ticket.title,
                time: formattedTime,
                location: ticket.ticket.event.location,
              },
            };
            this.eventEmitter.emit(
              'ticket.paid',
              new SendTicketEmailEvent(ticket.meta['email'], data),
            );
          }
          paid[ticketId] = ticket;
        }
      });
      return paid;
    } catch (error) {
      Logger.error(error);
    }
  }

  // Invitation section //
  async initInvitationIntention(invitationId: string, callback: string) {
    const payload = await this.formatPaymentInvitationData(
      invitationId,
      callback,
    );
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
        Logger.log(payload);
        throw Error('Error in payment gateway');
      }
    }
  }

  private async formatPaymentInvitationData(
    invitationId: string,
    callback: string,
  ) {
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        id: invitationId,
      },
    });

    const ticketInfo = await this.prisma.ticket.findFirst({
      where: {
        id: invitation.ticketId,
      },
    });

    // Fetch wallet token prices
    const prices = await this.prisma.walletToken.findFirst();
    if (!prices || !prices.usd_price) {
      throw new Error('Unable to fetch wallet token prices.');
    }

    // Calculate taxes
    const usdPrice = prices.usd_price;
    const taxRate = parseFloat(process.env.TAXES || '2.5'); // Default to 2.5 if TAXES is not set
    const taxPerTicket = taxRate * usdPrice;
    const amount = ticketInfo.price + taxPerTicket;
    // Convert amount to piastres (rounded integer)
    const amountInPiastres = Math.round(amount * 100);

    const payment_methods = process.env.PAYMENT_METHODS.replace(' ', '').split(
      ',',
    );
    await this.prisma.ticketPurchase.create({
      data: {
        id: invitationId,
        status: 'UPCOMMING',
        payment: 'PENDING',
        userId: 'kroking0',
        ticketId: ticketInfo.id,
      },
    });
    const data = {
      amount: amountInPiastres, // Paymob expects amount in piastres
      currency: 'EGP',
      payment_methods: payment_methods ? payment_methods : ['card', 'wallet'],
      billing_data: {
        first_name: invitation.name || 'Unknown',
        last_name: '-',
        phone_number: invitation.number || 'N/A',
        email: invitation.email || 'N/A',
      },
      extras: {
        userId: null,
        ticketsIds: null,
        invitationId: invitation.id,
      },
      special_reference: newId('transaction', 14),
      notification_url: PAYMENT_WEBHOOK_URL,
      redirection_url: callback,
    };

    return data;
  }

  private async updateInvitationStatus(
    invitationId: string,
    status: PaymentStatus,
  ) {
    try {
      const paid: Record<string, any> = {};
      const invitation = await this.prisma.invitation.update({
        where: {
          id: invitationId,
        },
        data: {
          payment: status,
        },
      });
      const ticket = await this.prisma.ticket.findFirst({
        where: {
          id: invitation.ticketId,
        },
        include: {
          event: true,
        },
      });
      await this.prisma.ticketPurchase.update({
        where: {
          id: invitationId,
        },
        data: {
          payment: status,
        },
      });

      if (status === 'PAID') {
        const timeString = ticket.event.time;
        const date = new Date(`2024-12-25T${timeString}:00`);
        const formattedTime = format(date, 'hh:mm a');
        const data: TicketEmailProps = {
          recipientName: invitation.name,
          eventName: ticket.event.title,
          eventImage: ticket.event.image,
          ticketDetails: {
            id: invitation.id,
            date: format(ticket.event.date, 'MMMM dd, yyyy'),
            type: ticket.title,
            time: formattedTime,
            location: ticket.event.location,
          },
        };
        this.eventEmitter.emit(
          'ticket.paid',
          new SendTicketEmailEvent(invitation.email, data),
        );
      }
      return paid;
    } catch (error) {
      Logger.error(error);
    }
  }
}
