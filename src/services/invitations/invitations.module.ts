import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { PaymentService } from '../payment/payment.service';

@Module({
  controllers: [InvitationsController],
  providers: [InvitationsService, PrismaService, PaymentService],
})
export class InvitationsModule {}
