import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CleanUpJob {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(CleanUpJob.name);

  @Cron(CronExpression.EVERY_3_HOURS, {
    name: 'CleanUp',
    timeZone: 'Africa/Cairo',
  })
  async handleCron() {
    this.logger.debug('CleanUp starting');

    const today = new Date().getDay() + 1;
    const endWhen = new Date(new Date(today).setHours(23, 59, 59, 999));

    try {
      // End published events that have reached their date
      const publishedEvents = await this.prismaService.event.updateMany({
        where: {
          status: 'PUBLISHED',
          date: {
            lte: endWhen, // Ensures events that occurred today or earlier are updated
          },
        },
        data: {
          status: 'ENDED',
        },
      });
      this.logger.log(`Ended Events: ${publishedEvents.count}`);

      // Invalidate tickets with pending or unpaid payments or attended status past the update date
      const invalidTickets = await this.prismaService.ticketPurchase.updateMany(
        {
          where: {
            payment: {
              in: ['PENDING', 'UN_PAID'], // Match pending and unpaid statuses
            },
            ticket: {
              event: {
                status: 'ENDED', // Only tickets for events that have ended
              },
            },
          },
          data: {
            status: 'PAST_DUE', // Set status to past due
          },
        },
      );

      this.logger.log(`Invalidated Tickets: ${invalidTickets.count}`);
    } catch (error) {
      // Log any error for debugging
      this.logger.error('Error occurred during CleanUp', error);
    }
  }
}
