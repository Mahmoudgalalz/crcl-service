import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PaymentService } from './payment.service';

@Module({
  controllers: [],
  providers: [PaymentService, PrismaService],
})
export class PaymentModule {}
