import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SendTicketEmailEvent } from '../events/sendTicket.event';
import { EmailService } from '../email.services';

@Injectable()
export class SendTicketEmailEventListener {
  constructor(private readonly emailService: EmailService) {}
  @OnEvent('ticket.paid')
  handleUserCreatedEvent(event: SendTicketEmailEvent) {
    this.emailService.sendTicketEmail(event);
  }
}
