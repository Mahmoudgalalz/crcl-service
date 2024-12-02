import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SendTicketEmailEvent } from '../events/sendTicket.event';
import { EmailService } from '../email.services';
import { SendOtpEvent } from '../events/sendOtp.event';

@Injectable()
export class SendTicketEmailEventListener {
  constructor(private readonly emailService: EmailService) {}
  @OnEvent('ticket.paid')
  handleUserCreatedEvent(event: SendTicketEmailEvent) {
    this.emailService.sendTicketEmail(event);
  }

  @OnEvent('otp.request')
  handleOtpCreatedEvent(event: SendOtpEvent) {
    this.emailService.sendOtpEmail(event);
  }
}
