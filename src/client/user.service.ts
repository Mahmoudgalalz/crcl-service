import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserUpdateDto } from './dto/user-update.dto';
import { newId } from 'src/common/uniqueId.utils';
import { MetaRequestDto } from './dto/events.dto';
import { BcryptService } from 'src/shared/auth/shared/bcrypt.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcryptService: BcryptService,
  ) {}

  async update(id: string, data: UserUpdateDto) {
    if (data.password) {
      const { password, ...restData } = data;
      const hashedPassword = await this.bcryptService.hashPassword(password);
      await this.prisma.user.update({
        where: { id },
        data: {
          password: hashedPassword,
          ...restData,
        },
      });
    }
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    if (!user) {
      throw new NotFoundException('User not Found');
    }
    return user;
  }

  async addFavoriteEvent(userId: string, eventId: string) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        favoriteEvents: {
          push: eventId,
        },
      },
    });
  }

  async get(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id },
      select: {
        name: true,
        email: true,
        number: true,
        facebook: true,
        instagram: true,
        gender: true,
        picture: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        wallet: true,
        tickets: true,
      },
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
    const [user, token] = await this.prisma.$transaction([
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
      this.prisma.walletToken.findFirst({ where: { id: 1 } }),
    ]);
    if (!user) throw 'User not found';
    if (!user.wallet?.id) {
      const wallet = await this.prisma.wallet.create({
        data: {
          id: newId('wallet', 14),
          balance: 0,
          user: {
            connect: { id: id },
          },
        },
      });
      return wallet;
    }
    return { ...user, token };
  }

  async userInitTicketRequest(
    id: string,
    eventId: string,
    data: MetaRequestDto[],
  ) {
    const shallowData = Array.isArray(data)
      ? JSON.parse(JSON.stringify(data))
      : [JSON.parse(JSON.stringify(data))];
    const check = await this.prisma.eventRequest.count({
      where: {
        eventId,
        userId: id,
      },
    });
    if (!check) {
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
    throw Error('Already requested for this event');
  }

  //? not used
  async userTicketsToBuy(id: string) {
    const tickets = await this.prisma.ticketPurchase.findMany({
      where: { userId: id, status: 'UPCOMMING', payment: 'PENDING' },
      select: {
        meta: true,
        status: true,
        payment: true,
        createdAt: true,
        updateAt: true,
        user: {
          select: {
            name: true,
            email: true,
            number: true,
          },
        },
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

  async userRequests(id: string) {
    // Step 1: Fetch all event requests for the given userId
    const requests = await this.prisma.eventRequest.findMany({
      where: { userId: id },
    });

    // Step 2: Extract ticketIds from all requests
    const ticketIds = requests.flatMap((request) => {
      const metaJSONvalue = request.meta as Array<object & any>; // Assuming meta is an array of objects
      return Array.isArray(metaJSONvalue)
        ? metaJSONvalue.map((item) => item.ticketId)
        : [];
    });

    // Step 3: Fetch all ticket details in one query using the extracted ticketIds
    const tickets = await this.prisma.ticket.findMany({
      where: {
        id: { in: ticketIds },
      },
      select: {
        id: true,
        title: true,
        price: true,
        event: {
          select: {
            title: true,
            time: true,
            location: true,
          },
        },
      },
    });

    // Step 4: Map ticket details and append the count and total price to each request
    const result = requests.map((request) => {
      const metaJSONvalue = request.meta as Array<object & any>; // Assuming meta is an array of objects
      const metaCount = metaJSONvalue.length;

      // Map ticket details back to the current request's metaJSONvalue
      const ticketDetails = metaJSONvalue.map((item) => {
        return tickets.find((ticket) => ticket.id === item.ticketId);
      });

      // Filter out valid tickets (non-null) and count them
      const validTickets = ticketDetails.filter(
        (ticket) => ticket !== undefined,
      );

      // Calculate the total price for the request
      const totalPrice = validTickets.reduce(
        (sum, ticket) => sum + (ticket?.price || 0),
        0,
      );

      return {
        ...request,
        metaCount, // Count of items in metaJSONvalue
        ticketDetails: validTickets, // Details of related tickets
        totalPrice, // Total price of the tickets for this request
        ticketCount: validTickets.length, // Count of valid tickets
      };
    });

    return result;
  }

  async userTickets(id: string) {
    const tickets = await this.prisma.ticketPurchase.findMany({
      where: { userId: id },
      select: {
        meta: true,
        payment: true,
        status: true,
        createdAt: true,
        updateAt: true,
        user: {
          select: {
            name: true,
            email: true,
            number: true,
          },
        },
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
          id: {
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

  private async tokenPrice() {
    const token = await this.prisma.walletToken.findFirst({
      where: { id: 1 },
    });
    return token.tokenPrice;
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
          id: true,
          name: true,
          wallet: true,
        },
      });
      if (boothWallet.wallet.id) {
        const tokenPrice = await this.tokenPrice();
        const transaction = await this.prisma.walletTransactions.create({
          data: {
            id: newId('transaction', 14),
            from: 'USER',
            to: `${boothWallet.name}@${boothWallet.id}`,
            status: 'PENDING',
            amount,
            tokenPrice,
            walletId: boothWallet.wallet.id,
          },
        });
        return transaction;
      }
    } catch (error) {
      Logger.error('Payment Error in wallet', error);
      throw error;
    }
  }

  async userCompeleteTransaction(id: string, transactionId: string) {
    try {
      const userWallet = await this.prisma.user.findFirst({
        where: {
          id,
          type: {
            in: ['USER'],
          },
        },
        select: {
          id: true,
          name: true,
          wallet: true,
        },
      });
      const updateBoothTransaction =
        await this.prisma.walletTransactions.findUnique({
          where: {
            id: transactionId,
          },
          include: {
            Wallet: true,
          },
        });
      if (userWallet.wallet.balance >= updateBoothTransaction.amount) {
        const [userTransaction, userWalletUpdate] =
          await this.prisma.$transaction([
            this.prisma.walletTransactions.create({
              data: {
                id: newId('transaction', 14),
                from: 'self',
                to: updateBoothTransaction.from,
                status: 'PAID',
                tokenPrice: updateBoothTransaction.tokenPrice,
                amount: updateBoothTransaction.amount,
                walletId: userWallet.wallet.id,
              },
            }),
            this.prisma.wallet.update({
              where: {
                id: userWallet.wallet.id,
              },
              data: {
                balance:
                  userWallet.wallet.balance - updateBoothTransaction.amount,
              },
            }),
            this.prisma.wallet.update({
              where: {
                id: updateBoothTransaction.walletId,
              },
              data: {
                balance:
                  updateBoothTransaction.Wallet.balance +
                  updateBoothTransaction.amount,
              },
            }),
            this.prisma.walletTransactions.update({
              where: {
                id: transactionId,
              },
              data: {
                from: `${userWallet.name}@${userWallet.id}`,
                status: 'PAID',
              },
            }),
          ]);
        return { userTransaction, userWalletUpdate };
      } else {
        throw new Error('Wallet has no sufficient balance');
      }
    } catch (error) {
      Logger.error('Payment Error in wallet', error);
      throw error;
    }
  }

  async readerTicketScan(id: string) {
    const tickets = await this.prisma.ticketPurchase.findUnique({
      where: { id: id },
      select: {
        meta: true,
        ticketId: true,
        payment: true,
        status: true,
        createdAt: true,
        updateAt: true,
        user: {
          select: {
            name: true,
            number: true,
            picture: true,
            email: true,
          },
        },
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
              },
            },
          },
        },
      },
    });
    if (!tickets) {
      throw new Error('Ticket not found');
    }
    return tickets;
  }

  async readerTicketOps(id: string) {
    const ticket = await this.prisma.ticketPurchase.findUnique({
      where: { id: id },
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (['ATTENDED', 'PAST_DUE'].includes(ticket.status)) {
      throw new Error('Ticket is already used or past due');
    }

    return await this.prisma.ticketPurchase.update({
      where: { id: id },
      data: {
        status: 'ATTENDED',
      },
      select: {
        meta: true,
        ticketId: true,
        payment: true,
        status: true,
        createdAt: true,
        updateAt: true,
        user: {
          select: {
            name: true,
            number: true,
            picture: true,
            email: true,
          },
        },
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
              },
            },
          },
        },
      },
    });
  }
}
