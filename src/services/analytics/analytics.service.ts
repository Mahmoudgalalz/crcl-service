import { Injectable, Logger } from '@nestjs/common';
import { TOKEN_PRICE } from 'src/common/uniqueId.utils';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Get total money from all transactions and payments
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
        walletTotal: walletResult._sum.amount || 0,
        paymentTotal: totalPaymentSum,
        combinedTotal:
          (walletResult._sum.amount * TOKEN_PRICE || 0) + totalPaymentSum,
      };
    } catch (error) {
      Logger.error('Error fetching total money:', error);
      throw new Error('Failed to fetch total money');
    }
  }

  // 2. Get booth transactions
  async getBoothTransactions() {
    return await this.prisma.walletTransactions.groupBy({
      by: ['to'],
      _sum: { amount: true },
      _count: { id: true },
      where: {
        Wallet: { user: { type: 'BOOTH' } },
      },
    });
  }

  // 3. Get event statistics (launched, upcoming, past events)
  async getEventStats() {
    const totalEvents = await this.prisma.event.count({
      where: { status: { notIn: ['DELETED', 'DRAFTED', 'CANCLED'] } },
    });
    const upcomingEvents = await this.prisma.event.count({
      where: {
        date: { gte: new Date() },
        status: 'PUBLISHED',
      },
    });
    const pastEvents = await this.prisma.event.count({
      where: {
        date: { lt: new Date() },
        status: { in: ['ENDED', 'PUBLISHED'] },
      },
    });
    return { totalEvents, upcomingEvents, pastEvents };
  }

  // 4. Get event request counts grouped by event
  async getEventRequestCounts() {
    return await this.prisma.eventRequest.groupBy({
      by: ['eventId'],
      _count: { id: true },
    });
  }

  // 5. Get total paid ticket purchases
  async getTotalPaidTickets() {
    const totalPaid = await this.prisma.ticketPurchase.count({
      where: { payment: 'PAID' },
    });
    return totalPaid;
  }

  // 6. Get user request counts for static periods (1 day, 3 days, etc.)
  async getUserRequestCountsForStaticPeriods() {
    const periods = [
      { name: '1_day', days: 1 },
      { name: '3_days', days: 3 },
      { name: '1_week', days: 7 },
      { name: '2_weeks', days: 14 },
      { name: '1_month', days: 30 },
      { name: '2_months', days: 60 },
      { name: '3_months', days: 90 },
    ];

    const results = [];
    for (const period of periods) {
      const startDate = new Date();
      const endDate = new Date();
      startDate.setDate(endDate.getDate() - period.days);
      const periodResults = await this.getUserRequestCounts(startDate, endDate);
      results.push({ period: period.name, data: periodResults });
    }
    return results;
  }

  private async getUserRequestCounts(startDate: Date, endDate: Date) {
    const result = await this.prisma.eventRequest.groupBy({
      by: ['userId', 'eventId'],
      _count: { id: true },
      where: { createdAt: { gte: startDate, lte: endDate } },
      orderBy: { _count: { id: 'desc' } },
    });

    const events = await this.prisma.event.findMany({
      where: { id: { in: result.map((request) => request.eventId) } },
      select: { id: true, title: true },
    });

    return result.map((request) => {
      const event = events.find((event) => event.id === request.eventId);
      return {
        userId: request.userId,
        eventId: request.eventId,
        eventName: event ? event.title : 'Unknown Event',
        requestCount: request._count.id,
      };
    });
  }

  // Aggregate all data or selectively based on params
  async getAllAnalytics(params: { [key: string]: boolean }) {
    const result: any = {};
    if (params.totalMoney || params.all)
      result.totalMoney = await this.getTotalMoney();
    if (params.boothTransactions || params.all)
      result.boothTransactions = await this.getBoothTransactions();
    if (params.eventStats || params.all)
      result.eventStats = await this.getEventStats();
    if (params.eventRequestCounts || params.all)
      result.eventRequestCounts = await this.getEventRequestCounts();
    if (params.totalPaidTickets || params.all)
      result.totalPaidTickets = await this.getTotalPaidTickets();
    if (params.userRequestCounts || params.all)
      result.userRequestCounts =
        await this.getUserRequestCountsForStaticPeriods();

    return result;
  }
}
