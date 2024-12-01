import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Resend } from 'resend';
import { Queue } from 'bull';
import { ResendEmailInput } from './types/email.input.type';
import { EmailType, TicketEmailProps, TicketProps } from './types/email.type';
import { Tokens } from 'src/shared/tokens';
import { render } from '@react-email/render';
import TicketEmail from 'emails/template/Ticket';
import EventTicket from 'emails/attachment';
import QRCode from 'qrcode'
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs/promises';
import { OnEvent } from '@nestjs/event-emitter';
import { SendTicketEmailEvent } from './events/sendTicket.event';

@Injectable()
export class EmailService {
  constructor(
    @Inject(Tokens.RESEND_CLIENT)
    private readonly _resendClient: Resend,
    @InjectQueue(EmailType.RESEND_EMAIL_HANDLER)
    private readonly mailQueue: Queue,
  ) {}

  private generateEmail = (template) => {
    return render(template);
  };

  private async generateQRCode(code: string) {
    return await QRCode.toString(code,{
      type: 'svg',
    })
  }

  private async generateTicketAttachment(data: TicketProps){
    const { html } = await import('satori-html');
    const tamplate = html(EventTicket(data));

    const robotoFontData = await fs.readFile(
      'node_modules/@fontsource/roboto/files/roboto-cyrillic-400-normal.woff',
    );

    const svg = await satori(tamplate, {
      width: 600,
      height: 300,
      fonts: [
        {
          name: 'Roboto',
          data: robotoFontData,
          weight: 400,
          style: 'normal',
        },
        ],
    });

    const resvg = new Resvg(svg);

    const pngData = resvg.render();
    return { png: pngData.asPng(), svg };
  }

  async sendTicketEmail(event: SendTicketEmailEvent) {
    const { to, data } = event;
    const qrCodeSVG = await this.generateQRCode(data.ticketDetails.id)
    const html = await this.generateEmail(TicketEmail(data));
    const attachment = (await this.generateTicketAttachment({
      organizerName: 'CRCL Events',
      ticketOwner: data.recipientName,
      ticketType: data.ticketDetails.type,
      time: data.ticketDetails.time,
      eventName: data.eventName,
      date: data.ticketDetails.date,
      qrCodeSvg: qrCodeSVG
    })).png;
  
    const emailInput: ResendEmailInput = {
      from: 'CRCL Events <no-reply@crclevents.com>',
      to,
      subject: `CRCL: Ticket details for ${data.eventName}!`,
      html,
      attachments: [{
        filename: `Ticket for ${data.eventName}`,
        content: attachment,
      }]
    };
    return this.mailQueue.add(EmailType.TICKET_PAID, emailInput, {
      attempts: 3,
    });
  }

  async sendEmail(data: ResendEmailInput) {
    const emailInput: ResendEmailInput = {
      from: 'CRCL Events <no-reply@crclevents.com>',
      to: data.to,
      subject: data.subject,
      html: data.html,
      attachments: data.attachments,
    };
    return this._resendClient.emails.send(emailInput);
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
