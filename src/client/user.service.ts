import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserUpdateDto } from './dto/user-update.dto';
import { newId } from 'src/common/uniqueId.utils';
import { MetaRequestDto } from './dto/events.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async update(id: string, data: UserUpdateDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    if (!user) {
      throw new NotFoundException('User not Found');
    }
    return user;
  }

  // payment through wallet
  // Booth create a transaction
  // transaction details, Booth name, amount, dates and so on

  async UserWallet(id: string) {
    const user = await this.prisma.$transaction([
      this.prisma.user.findFirstOrThrow({
        where: {
          id,
          type: {
            in: ['BOOTH', 'USER'],
          },
        },
        select: {
          wallet: {
            include: {
              transactions: true,
            },
          },
          type: true,
        },
      }),
      this.prisma.wallet
    ])
    if (!user) throw 'User not found';
    if (user.wallet?.id) {
      return await this.prisma.wallet.create({
        data: {
          id: newId('wallet', 14),
          balance: 0,
          user: {
            connect: { id: id },
          },
        },
      });
    }
  }

  async userInitTicketRequest(
    id: string,
    eventId: string,
    data: MetaRequestDto[],
  ) {
    const shallowData = Array.isArray(data)
      ? JSON.parse(JSON.stringify(data))
      : [JSON.parse(JSON.stringify(data))];
    const request = await this.prisma.eventRequest.create({
      data: {
        id: newId('ref', 14),
        user: {
          connect: { id },
        },
        event: {
          connect: { id: eventId },
        },
        meta: shallowData,
      },
    });
    return request;
  }

  async userTicketsToBuy(id: string) {
    const tickets = await this.prisma.ticketPurchase.findMany({
      where: { userId: id },
      include: {
        ticket: {
          select: {
            title: true,
            price: true,
            description: true,
            event: {
              select: {
                title: true,
                time: true,
                date: true,
                image: true,
              },
            },
          },
        },
      },
    });
    return tickets;
  }

  //? This need to synced with payment
  async userPayTickets(id: string, ticketIds: string[]) {
    try {
      const ticketsToBuy = await this.prisma.ticketPurchase.findMany({
        where: {
          userId: id,
          ticketId: {
            in: ticketIds,
          },
        },
        include: {
          ticket: {
            select: {
              price: true,
            },
          },
        },
      });
      //! caclulate payment and procced here, then switch
      const totalResults = ticketsToBuy.reduce(
        (acc, ticket) => {
          acc.totalPrice += ticket.ticket.price;
          acc.ticketIds.push(ticket.ticketId);
          return acc;
        },
        { totalPrice: 0, ticketIds: [] as string[] },
      );
      //! assume its paid
      const flipStatus = await this.prisma.ticketPurchase.updateMany({
        where: {
          userId: id,
          ticketId: {
            in: totalResults.ticketIds,
          },
        },
        data: {
          payment: 'PAID',
        },
      });
      return flipStatus;
    } catch (err) {
      Logger.error('Payment Error in tickets', err);
      throw err;
    }
  }

  async BoothInitTransaction(id: string, amount: number) {
    try {
      const boothWallet = await this.prisma.user.findFirst({
        where: {
          id,
          type: {
            in: ['BOOTH'],
          },
        },
        select: {
          wallet: true,
        },
      });
      if (boothWallet.wallet.id) {
        const transaction = await this.prisma.walletTransactions.create()
      }
    } catch (error) {
      Logger.error('Payment Error in wallet', error);
      throw error;
    }
  }

  async userCompeleteTransaction(id: string, transactionId: string){
    try {
      const boothWallet = await this.prisma.user.findFirst({
        where: {
          id,
          type: {
            in: ['USER'],
          },
        },
        select: {
          wallet: true,
        },
      });
      if (boothWallet.wallet.id) {
        const transaction = await this.prisma.walletTransactions.create()
      }
    } catch (error) {
      Logger.error('Payment Error in wallet', error);
      throw error;
    }
  }
}
