import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { newId } from 'src/common/uniqueId.utils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateInvitationDto } from './dtos/create-invitation.dto';
import { SendTicketEmailEvent } from '../email/events/sendTicket.event';
import {
  TicketEmailProps,
  TicketPayEmailProps,
} from '../email/types/email.type';
import { format } from 'date-fns';
import { TicketPayEvent } from '../email/events/sendOtp.event';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createInvitation(data: CreateInvitationDto) {
    const id = newId('invitations', 16);
    const event = await this.prisma.event.findFirst({
      where: {
        id: data.eventId,
      },
    });
    if (data.type != 'paid') {
      const invitation = await this.prisma.invitation.create({
        data: {
          id,
          ...data,
        },
      });
      const timeString = event.time;
      const date = new Date(`2024-12-25T${timeString}:00`);
      const formattedTime = format(date, 'hh:mm a');
      const emailData: TicketEmailProps = {
        recipientName: data.name,
        eventName: event.title,
        eventImage: event.image,
        ticketDetails: {
          id: invitation.id,
          date: format(event.date, 'MMMM dd, yyyy'),
          type: data.type,
          time: formattedTime,
          location: event.location,
        },
      };
      this.eventEmitter.emit(
        'ticket.paid',
        new SendTicketEmailEvent(data.email, emailData),
      );
      return invitation;
    } else {
      const invitation = await this.prisma.invitation.create({
        data: {
          id,
          ...data,
          payment: 'PENDING',
        },
      });
      const ticket = await this.prisma.ticket.findFirst({
        where: {
          id: data.ticketId,
        },
      });

      const timeString = event.time;
      const date = new Date(`2024-12-25T${timeString}:00`);
      const formattedTime = format(date, 'hh:mm a');
      const dataEmail: TicketPayEmailProps = {
        recipientName: data.name,
        eventName: event.title,
        eventImage: event.image,
        ticket: {
          price: ticket.price,
          type: ticket.title,
        },
        eventDetails: {
          location: event.location,
          date: format(event.date, 'MMMM dd, yyyy'),
          time: formattedTime,
        },
        redirectUrl: 'https://crclevents.com/app',
      };
      this.eventEmitter.emit(
        'request.creation',
        new TicketPayEvent(data.email, dataEmail),
      );
      return invitation;
    }
  }
}
