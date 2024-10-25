import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class BoothManagementService {
  constructor(private readonly prisma: PrismaService) {}

  async readTransactions(boothId: string) {
    return this.prisma.wallet.findMany({
      where: {
        userId: boothId,
      },
      include: {
        transactions: true,
      },
    });
  }

  async boothAccounts() {
    return await this.prisma.user.findMany({
      where: {
        type: 'BOOTH',
      },
      include: {
        wallet: {
          select: {
            balance: true,
          },
        },
      },
    });
  }

  async tokenPrice() {
    return await this.prisma.walletToken.findFirst({
      where: {
        id: 1,
      },
      select: {
        tokenPrice: true,
      },
    });
  }
  async withdrawMoney(boothId: string, amount: number) {
    const booth = await this.prisma.wallet.findFirst({
      where: {
        userId: boothId,
      },
    });
    if (booth.balance >= amount) {
      return this.prisma.wallet.update({
        where: {
          id: booth.id,
        },
        data: {
          balance: booth.balance - amount,
        },
      });
    }
    throw Error('Not enough balance');
  }
}
