import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserUpdateDto } from './dto/user-update.dto';
import { newId } from 'src/common/uniqueId.utils';
import { MetaRequestDto } from './dto/events.dto';
import { BcryptService } from 'src/shared/auth/shared/bcrypt.service';
import { PaymentService } from 'src/services/payment/payment.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcryptService: BcryptService,
    private readonly paymentService: PaymentService,
  ) {}

  async update(id: string, data: UserUpdateDto) {
    const userExist = await this.checkUserExists(id);
    if (userExist && data.number && userExist.number !== data.number) {
      const user = await this.prisma.user.findFirst({
        where: { number: data.number },
      });
      if (user) {
        throw new BadRequestException('Phone number already exists');
      }
    }
    if (data.password) {
      const { password, ...restData } = data;
      const hashedPassword = await this.bcryptService.hashPassword(password);
      return await this.prisma.user.update({
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

  async checkUserExists(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
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

  async removeFavoriteEvent(userId: string, eventId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
      select: { favoriteEvents: true },
    });

    if (!user || !user.favoriteEvents) {
      throw new Error('User not found or favorite events not initialized');
    }

    const newFavEvents = user.favoriteEvents.filter(
      (favEvent) => favEvent !== eventId,
    );

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { favoriteEvents: newFavEvents },
      select: { favoriteEvents: true },
    });

    return updatedUser.favoriteEvents;
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
        notificationToken: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        wallet: true,
        tickets: {
          include: {
            ticket: {
              select: {
                title: true,
                price: true,
                description: true,
              },
            },
          },
        },
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

    const ticketsInRequest = shallowData.length;
    const existingRequests = await this.prisma.eventRequest.findMany({
      where: {
        eventId,
        userId: id,
      },
      select: {
        meta: true,
      },
    });

    const totalTicketsRequested = existingRequests.reduce((sum, req) => {
      const meta = req.meta as unknown as MetaRequestDto[];
      return sum + (Array.isArray(meta) ? meta.length : 0);
    }, 0);
    if (totalTicketsRequested + ticketsInRequest > 5) {
      throw new Error('You cannot request more than 5 tickets for this event.');
    }
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

  async userRequests(id: string) {
    // Step 1: Fetch all event requests for the given userId
    const requests = await this.prisma.eventRequest.findMany({
      where: { userId: id },
    });

    // Step 2: Extract ticketIds from all requests
    const ticketIds = requests
      .flatMap((request) => {
        const metaJSONvalue = request.meta as Array<object & any>;
        return Array.isArray(metaJSONvalue)
          ? metaJSONvalue
              .map((item) => item.ticketId)
              .filter((id) => id !== undefined)
          : [];
      })
      .filter((id) => id !== undefined);

    // Step 3: Fetch all ticket details in one query using the extracted ticketIds
    const tickets = await this.prisma.ticket.findMany({
      where: {
        id: { in: ticketIds },
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        event: {
          select: {
            title: true,
            time: true,
            date: true,
            location: true,
          },
        },
      },
    });

    // Step 4: Map ticket details and append the count and total price to each request
    const result = requests.map((request) => {
      const metaJSONvalue = request.meta as Array<object & any>;
      const metaCount = metaJSONvalue.length;

      // Map ticket details back to the current request's metaJSONvalue
      const ticketDetails = metaJSONvalue
        .map((item) => {
          return tickets.find((ticket) => ticket.id === item.ticketId);
        })
        .filter((ticket) => ticket !== undefined);

      // Calculate the total price for the request
      const totalPrice = ticketDetails.reduce(
        (sum, ticket) => sum + (ticket?.price || 0),
        0,
      );

      return {
        ...request,
        metaCount,
        ticketDetails,
        totalPrice,
        ticketCount: ticketDetails.length,
      };
    });

    return result;
  }

  async userTickets(id: string) {
    const tickets = await this.prisma.ticketPurchase.findMany({
      where: { userId: id },
      select: {
        id: true,
        ticketId: true,
        meta: true,
        payment: true,
        status: true,
        createdAt: true,
        updateAt: true,
        paymentReference: true,
        user: {
          select: {
            name: true,
            email: true,
            number: true,
          },
        },
        ticket: {
          select: {
            id: true,
            title: true,
            price: true,
            description: true,
            event: {
              select: {
                title: true,
                time: true,
                date: true,
                location: true,
                image: true,
              },
            },
          },
        },
      },
    });
    return tickets;
  }

  async deleteUser(userId: string) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        deletedAt: Date.now().toString(),
      },
    });
  }

  async userPayTickets(id: string, ticketIds: string[], callback: string) {
    try {
      // Fetch all tickets for the provided ticketIds
      const ticketsP = await this.prisma.ticketPurchase.findMany({
        where: { id: { in: ticketIds } },
      });

      // Extract ticket IDs from purchases
      const pIds = ticketsP.map((ticket) => ticket.ticketId);

      // Log ticket purchases for debugging
      Logger.log(`Fetched ticketsP: ${JSON.stringify(ticketsP)}`);

      const tickets = await this.prisma.ticket.findMany({
        where: { id: { in: pIds } },
      });

      // Log fetched tickets for debugging
      Logger.log(`Fetched tickets: ${JSON.stringify(tickets)}`);

      if (ticketsP.length !== ticketIds.length) {
        const missingTickets = ticketIds.filter(
          (id) => !ticketsP.some((ticket) => ticket.id === id),
        );
        Logger.error(
          `Invalid tickets detected: ${JSON.stringify(missingTickets)}`,
        );
        throw new BadRequestException('One or more tickets are invalid.');
      }

      // Fetch sold ticket counts in bulk for better performance
      const ticketSales = await this.prisma.ticketPurchase.groupBy({
        by: ['ticketId'],
        where: { ticketId: { in: ticketIds } },
        _count: { ticketId: true },
      });

      // Log ticket sales for debugging
      Logger.log(`Ticket sales: ${JSON.stringify(ticketSales)}`);

      // Map to check sold count by ticketId
      const soldCounts = Object.fromEntries(
        ticketSales.map((sale) => [sale.ticketId, sale._count.ticketId]),
      );

      // Check capacity for each ticket
      const soldOutTickets = tickets.filter((ticket) => {
        const ticketsSold = soldCounts[ticket.id] || 0;
        return ticket.capacity - ticketsSold <= 0;
      });

      if (soldOutTickets.length > 0) {
        const soldOutTitles = soldOutTickets
          .map((ticket) => ticket.title)
          .join(', ');
        Logger.error(
          `The following tickets are sold out: ${JSON.stringify(
            soldOutTitles,
          )}`,
        );
        throw new BadRequestException(
          `The following tickets are sold out and cannot be purchased: ${soldOutTitles}.`,
        );
      }

      // Initialize payment intention
      const paymentUrl = await this.paymentService.initIntention(
        ticketIds,
        id,
        callback,
      );
      return paymentUrl;
    } catch (err) {
      Logger.error('Payment Error in tickets', err.message || err);
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
    if (!id) throw new Error('User ID does not exist');

    try {
      // Fetch the booth wallet details
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

      // Check if boothWallet exists and has a wallet
      if (!boothWallet) {
        throw new Error('Booth user not found');
      }
      if (!boothWallet.wallet || !boothWallet.wallet.id) {
        await this.UserWallet(id);
      }

      // Get the token price
      const tokenPrice = await this.tokenPrice();

      // Create the transaction
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
    } catch (error) {
      // Log the error and rethrow it
      Logger.error('Payment Error in wallet', error.message || error);
      throw new Error(`Payment Error: ${error.message || error}`);
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

  async readerTicketInvitationScan(id: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: id },
    });
    if (!invitation) {
      throw new Error('Ticket not found');
    }
    if (invitation.ticketId === null) {
      const event = await this.prisma.event.findFirst({
        where: { id: invitation.eventId },
      });

      return {
        ticket: {
          title: invitation.type,
          event: {
            title: event.title,
            time: event.time,
            date: event.date,
          },
        },
        meta: {
          name: invitation.name,
          social: null,
          email: invitation.email,
          number: invitation.number,
        },
      };
    }
    const ticket = await this.prisma.ticketPurchase.findUnique({
      where: {
        id: invitation.id,
      },
      select: {
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

    return {
      ...ticket,
      meta: {
        name: invitation.name,
        social: null,
        email: invitation.email,
        number: invitation.number,
      },
    };
  }

  async readerTicketInvitationOps(id: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: id },
    });

    if (!invitation) {
      throw new Error('Ticket not found');
    }

    if (['ATTENDED'].includes(invitation.status)) {
      throw new Error('Ticket is already used or past due');
    }

    await this.prisma.invitation.update({
      where: {
        id,
      },
      data: {
        status: 'ATTENDED',
      },
    });
    if (invitation.ticketId) {
      const ticketPurchase = await this.prisma.ticketPurchase.findUnique({
        where: { id: invitation.ticketId },
        select: {
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
      return {
        ...ticketPurchase,
        meta: {
          name: invitation.name,
          social: null,
          email: invitation.email,
          number: invitation.number,
        },
      };
    } else {
      const event = await this.prisma.event.findFirst({
        where: { id: invitation.eventId },
      });

      return {
        ticket: {
          title: invitation.type,
          event: {
            title: event.title,
            time: event.time,
            date: event.date,
          },
        },
        meta: {
          name: invitation.name,
          social: null,
          email: invitation.email,
          number: invitation.number,
        },
      };
    }
  }
}
