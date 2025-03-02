import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { Resend } from 'resend';
import { EmailType } from './types/email.type';
import { Tokens } from 'src/shared/tokens';
import { EmailQueueProcessor } from './email.queue.processor';
import { EmailService } from './email.services';
import { SendTicketEmailEventListener } from './listener/sendTicket.listener';

@Module({
  imports: [
    BullModule.registerQueue({
      name: EmailType.RESEND_EMAIL_HANDLER,
    }),
  ],
  providers: [
    {
      provide: Tokens.RESEND_CLIENT,
      useFactory: () => new Resend(process.env.RESEND_API_KEY),
    },
    EmailService,
    EmailQueueProcessor,
    SendTicketEmailEventListener,
  ],
})
export class EmailModule {}
