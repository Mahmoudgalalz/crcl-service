import { Injectable, Logger } from '@nestjs/common';
import { TOKEN_PRICE } from 'src/common/uniqueId.utils';
import { PrismaService } from 'src/prisma.service';
import { toZonedTime, fromZonedTime } from 'date-fns-tz'; // Make sure you import these functions

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Group booth transactions and calculate total money for each booth user
  async getBoothTransactionsWithTotal() {
    const groupedTransactions = await this.prisma.walletTransactions.groupBy({
      by: ['walletId'],
      _sum: { amount: true },
      where: {
        Wallet: {
          user: { type: 'BOOTH' },
        },
      },
    });

    return Promise.all(
      groupedTransactions.map(async (transaction) => {
        const wallet = await this.prisma.wallet.findUnique({
          where: { id: transaction.walletId },
          select: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        });
        return {
          ...transaction,
          user: wallet?.user,
          totalMoney: transaction._sum.amount * TOKEN_PRICE || 0,
        };
      }),
    );
  }

  async getEventDetailsWithRevenue(startDate: Date, endDate: Date) {
    const timeZone = 'Africa/Cairo';

    const localStartDate = toZonedTime(startDate, timeZone);
    const localEndDate = toZonedTime(endDate, timeZone);

    localStartDate.setHours(0, 0, 0, 0);
    localEndDate.setHours(23, 59, 59, 999);

    const normalizedStartDate = fromZonedTime(localStartDate, timeZone);
    const normalizedEndDate = fromZonedTime(localEndDate, timeZone);

    const events = await this.prisma.event.findMany({
      where: {
        date: {
          gte: normalizedStartDate,
          lte: normalizedEndDate,
        },
        status: { notIn: ['DELETED', 'DRAFTED', 'CANCLED'] },
      },
      select: {
        id: true,
        title: true,
        location: true,
        date: true,
        status: true,
        tickets: {
          include: {
            TicketPurchase: {
              select: {
                payment: true,
                ticket: { select: { price: true } },
              },
            },
          },
        },
        requests: {
          select: {
            id: true,
          },
        },
      },
    });

    const eventDetails = events.map((event) => {
      let totalRevenue = 0;
      let totalPaidTickets = 0;
      let totalUnpaidTickets = 0;
      let totalPendingTickets = 0;
      const totalRequests = event.requests.length;

      event.tickets.forEach((ticket) => {
        ticket.TicketPurchase?.forEach((purchase) => {
          if (purchase.payment === 'PAID') {
            totalRevenue += purchase.ticket.price || 0;
            totalPaidTickets += 1;
          } else if (purchase.payment === 'UN_PAID') {
            totalUnpaidTickets += 1;
          } else if (purchase.payment === 'PENDING') {
            totalPendingTickets += 1;
          }
        });
      });

      return {
        id: event.id,
        title: event.title,
        location: event.location,
        date: event.date,
        totalRevenue,
        totalPaidTickets,
        totalUnpaidTickets,
        totalPendingTickets,
        totalRequests,
      };
    });

    const totalEvents = eventDetails.length;
    const combinedRevenue = eventDetails.reduce(
      (sum, event) => sum + event.totalRevenue,
      0,
    );
    const totalPaidTickets = eventDetails.reduce(
      (sum, event) => sum + event.totalPaidTickets,
      0,
    );
    const totalUnpaidTickets = eventDetails.reduce(
      (sum, event) => sum + event.totalUnpaidTickets,
      0,
    );
    const totalPendingTickets = eventDetails.reduce(
      (sum, event) => sum + event.totalPendingTickets,
      0,
    );
    const totalRequests = eventDetails.reduce(
      (sum, event) => sum + event.totalRequests,
      0,
    );

    return {
      totalEvents,
      combinedRevenue,
      totalPaidTickets,
      totalUnpaidTickets,
      totalPendingTickets,
      totalRequests,
      eventDetails,
    };
  }

  async getTotalMoney() {
    try {
      const walletResult = await this.prisma.walletTransactions.aggregate({
        _sum: { amount: true },
      });

      const ticketPurchases = await this.prisma.ticketPurchase.findMany({
        where: { payment: 'PAID' },
        include: { ticket: { select: { price: true } } },
      });

      const totalPaymentSum = ticketPurchases.reduce(
        (sum, purchase) => sum + (purchase.ticket?.price || 0),
        0,
      );

      return {
        walletTotal: walletResult._sum.amount * TOKEN_PRICE || 0,
        paymentTotal: totalPaymentSum,
        combinedTotal:
          (walletResult._sum.amount * TOKEN_PRICE || 0) + totalPaymentSum,
      };
    } catch (error) {
      Logger.error('Error fetching total money:', error);
      throw new Error('Failed to fetch total money');
    }
  }

  async getEventStats() {
    const [totalEvents, upcomingEvents, pastEvents] =
      await this.prisma.$transaction([
        this.prisma.event.count({
          where: { status: { notIn: ['DELETED', 'DRAFTED', 'CANCLED'] } },
        }),
        this.prisma.event.count({
          where: {
            date: { gte: new Date() },
            status: 'PUBLISHED',
          },
        }),
        this.prisma.event.count({
          where: {
            date: { lt: new Date() },
            status: { in: ['ENDED', 'PUBLISHED'] },
          },
        }),
      ]);

    return { totalEvents, upcomingEvents, pastEvents };
  }

  // 5. Get event request counts grouped by event
  async getEventRequestCounts() {
    const requestCounts = await this.prisma.eventRequest.groupBy({
      by: ['eventId'],
      _count: { id: true },
    });

    const eventIds = requestCounts.map((count) => count.eventId);
    const events = await this.prisma.event.findMany({
      where: {
        id: { in: eventIds },
      },
      select: {
        id: true,
        title: true,
      },
    });

    const eventRequestCounts = requestCounts.map((requestCount) => {
      const event = events.find((event) => event.id === requestCount.eventId);
      return {
        eventId: requestCount.eventId,
        eventTitle: event?.title || 'Unknown', // Default to 'Unknown' if event title is not found
        requestCount: requestCount._count.id,
      };
    });

    return eventRequestCounts;
  }

  // 6. Get total paid ticket purchases
  async getTotalTicketsWithStatus() {
    const [paid, unpaid, pending] = await this.prisma.$transaction([
      this.prisma.ticketPurchase.count({ where: { payment: 'PAID' } }),
      this.prisma.ticketPurchase.count({ where: { payment: 'UN_PAID' } }),
      this.prisma.ticketPurchase.count({ where: { payment: 'PENDING' } }),
    ]);

    return { paid, unpaid, pending };
  }

  // 7. Aggregate all analytics data or selectively based on params
  async getAllAnalytics(
    params: { [key: string]: boolean },
    startDate: Date,
    endDate: Date,
  ) {
    const result: any = {};

    if (!startDate || !endDate) {
      throw new Error(
        'startDate and endDate are required for non-booth analytics',
      );
    }

    // Handle analytics requiring dates
    if (params.totalMoney || params.all) {
      result.totalMoney = await this.getTotalMoney();
    }
    if (params.eventStats || params.all) {
      result.eventStats = await this.getEventStats();
    }
    if (params.eventRequestCounts || params.all) {
      result.eventRequestCounts = await this.getEventRequestCounts();
    }
    if (params.totalPaidTickets || params.all) {
      result.totalPaidTickets = await this.getTotalTicketsWithStatus();
    }
    if (params.userRequestCounts || params.all) {
      result.userRequestCounts = await this.getEventDetailsWithRevenue(
        startDate,
        endDate,
      );
    }

    return result;
  }
}
