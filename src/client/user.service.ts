import { Injectable, NotFoundException } from '@nestjs/common';
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
    const user = await this.prisma.user.findFirstOrThrow({
      where: {
        id,
        type: {
          in: ['BOOTH', 'USER'],
        },
      },
      select: {
        wallet: true,
        type: true,
      },
    });
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

  // async BoothInitTransaction(id: string, amount: number) {
  //   try {
  //     const boothWallet = await this.prisma.user.findFirst({
  //       where: {
  //         id,
  //         type: {
  //           in: ['BOOTH'],
  //         },
  //       },
  //       select: {
  //         wallet: true,
  //       },
  //     });
  //     if (boothWallet.wallet.id) {
  //       const transaction = await this.prisma
  //     }
  //   } catch (error) {}
  // }
}
