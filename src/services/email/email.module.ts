import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { Resend } from 'resend';
import { PrismaService } from 'src/prisma.service';
import { EmailType } from './types/email.type';
import { Tokens } from 'src/shared/tokens';
import { EmailQueueProcessor } from './email.queue.processor';
import { EmailService } from './email.services';

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
    PrismaService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
