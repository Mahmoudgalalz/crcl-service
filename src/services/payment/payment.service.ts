import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async initIntention(amount: number, items: any, user: User) {}

  async paymentCallback(body) {}
}
