import { Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Resend } from 'resend';
import { Queue } from 'bull';
import { ResendEmailInput } from './types/email.input.type';
import { EmailType } from './types/email.type';
import { Tokens } from 'src/shared/tokens';
import { render } from '@react-email/render';
import TicketEmail from 'emails/template/Ticket';
import QRCode from 'qrcode';
import { SendTicketEmailEvent } from './events/sendTicket.event';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import OtpEmail from 'emails/template/Otp';
import {
  RequestApprovedEvent,
  SendOtpEvent,
  TicketPayEvent,
} from './events/sendOtp.event';
import TicketApprovalEmail from 'emails/template/TicketApprovalEmail';
import TicketPayEmail from 'emails/template/TicketPay';

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

  private dirPath = (hash: string) => {
    return join(__dirname, '../../..', '../data', hash);
  };

  private async generateQRCode(code: string) {
    const QRBuffer = await QRCode.toBuffer(code);
    const url = process.env.UPLOAD_DOMAIN;
    const hash = code.substring(6, code.length) + '.png';
    await writeFile(this.dirPath(hash), QRBuffer);
    return `${url}/upload/${hash}`;
  }
  // private async generateTicketAttachment(data: TicketProps) {
  //   const { html } = await import('satori-html');
  //   const tamplate = html(EventTicket(data));

  //   Logger.log('Generated Template:', tamplate);

  //   const robotoFontData = await fs.readFile(
  //     path.resolve(
  //       'node_modules/@fontsource/roboto/files/roboto-cyrillic-400-normal.woff',
  //     ),
  //   );

  //   if (!robotoFontData) {
  //     throw new Error('Roboto font data not found');
  //   }

  //   const svg = await satori(tamplate, {
  //     width: 600,
  //     height: 300,
  //     fonts: [
  //       {
  //         name: 'Roboto',
  //         data: robotoFontData,
  //         weight: 400,
  //         style: 'normal',
  //       },
  //     ],
  //   });

  //   Logger.log('Generated SVG:', svg);

  //   try {
  //     const resvg = new Resvg(svg);
  //     const pngData = resvg.render();

  //     Logger.log('PNG Generated');
  //     await fs.writeFile('output.png', pngData.asPng());
  //     return { png: pngData.asPng(), svg };
  //   } catch (error) {
  //     Logger.error('Resvg Error:', error);
  //     throw error;
  //   }
  // }

  async sendTicketEmail(event: SendTicketEmailEvent) {
    const { to, data } = event;
    const qrCodeSVG = await this.generateQRCode(data.ticketDetails.id);
    const html = await this.generateEmail(TicketEmail({ qrCodeSVG, ...data }));

    const emailInput: ResendEmailInput = {
      from: 'CRCL Events <no-reply@crclevents.com>',
      to,
      subject: `CRCL: Ticket details for ${data.eventName}!`,
      html,
    };
    return this.mailQueue.add(EmailType.TICKET_PAID, emailInput, {
      attempts: 3,
    });
  }

  async sendOtpEmail(event: SendOtpEvent) {
    const { to, data } = event;
    const html = await this.generateEmail(OtpEmail(data));
    const emailInput: ResendEmailInput = {
      from: 'CRCL Events <no-reply@crclevents.com>',
      to,
      subject: `CRCL: your verification code!`,
      html,
    };
    return this.mailQueue.add(EmailType.NOTIFICATION_EMAIL, emailInput, {
      attempts: 3,
    });
  }

  async sendTicketInvitationEmail(event: TicketPayEvent) {
    const { to, data } = event;
    const html = await this.generateEmail(TicketPayEmail(data));
    const emailInput: ResendEmailInput = {
      from: 'CRCL Events <no-reply@crclevents.com>',
      to,
      subject: `CRCL: Ticket details for ${data.eventName}!`,
      html,
    };
    return this.mailQueue.add(EmailType.TICKET_PAID, emailInput, {
      attempts: 3,
    });
  }

  async sendRequestApprovedEmail(event: RequestApprovedEvent) {
    const { to, data } = event;
    const html = await this.generateEmail(TicketApprovalEmail(data));
    const emailInput: ResendEmailInput = {
      from: 'CRCL Events <no-reply@crclevents.com>',
      to,
      subject: `CRCL: Booking Approved - Time to compelete Your Payment!`,
      html,
    };
    return this.mailQueue.add(EmailType.NOTIFICATION_EMAIL, emailInput, {
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
