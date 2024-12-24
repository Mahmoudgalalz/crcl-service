import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class BoothManagementService {
  constructor(private readonly prisma: PrismaService) {}

  async readTransactions(
    boothId: string,
    page: number = 1,
    pageSize: number = 10,
  ) {
    const wallet = await this.prisma.wallet.findFirst({
      where: {
        userId: boothId,
      },
    });

    if (!wallet) {
      return {
        transactions: [],
        totalPages: 0,
        currentPage: page,
        totalTransactions: 0,
        transactionsCount: 0,
      };
    }

    const skip = (page - 1) * pageSize;

    const [transactions, totalCount] = await Promise.all([
      this.prisma.walletTransactions.findMany({
        where: {
          walletId: wallet.id,
        },
        skip,
        take: pageSize,
      }),
      this.prisma.walletTransactions.count({
        where: {
          walletId: wallet.id,
        },
      }),
    ]);

    return {
      transactions,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      totalTransactions: totalCount,
      transactionsCount: transactions.length,
    };
  }

  async boothAccounts() {
    return await this.prisma.user.findMany({
      where: {
        type: 'BOOTH',
        deletedAt: null,
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
