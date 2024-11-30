import { Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Resend } from 'resend';
import { Queue } from 'bull';
import { ResendEmailInput } from './types/email.input.type';
import { EmailType } from './types/email.type';
import { Tokens } from 'src/shared/tokens';

@Injectable()
export class EmailService {
  constructor(
    @Inject(Tokens.RESEND_CLIENT)
    private readonly _resendClient: Resend,
    @InjectQueue(EmailType.RESEND_EMAIL_HANDLER)
    private readonly mailQueue: Queue,
  ) {}

  async sendEmail(data: ResendEmailInput) {
    const emailInput: ResendEmailInput = {
      from: 'CRCL Events <no-reply@crclevents.com>',
      to: data.to,
      subject: data.subject,
      html: data.html,
    };
    return this.mailQueue.add(EmailType.TICKET_PAID, emailInput, {
      attempts: 3,
    });
  }

  async sendNotificationEmail(batchs: ResendEmailInput[]) {
    try {
      await this._resendClient.batch.send(batchs);
      return true;
    } catch (error) {
      return false;
    }
  }
}
