import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CleanUpJob {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(CleanUpJob.name);

  @Cron(CronExpression.EVERY_3_HOURS)
  async handleCron() {
    this.logger.debug('CleanUp starting');

    const today = new Date();

    try {
      // End published events that have reached their date
      const publishedEvents = await this.prismaService.event.updateMany({
        where: {
          status: 'PUBLISHED',
          date: {
            lte: today, // Ensures events that occurred today or earlier are updated
          },
        },
        data: {
          status: 'ENDED',
        },
      });
      this.logger.log(`Ended Events: ${publishedEvents.count}`);

      // // Invalidate tickets with pending or unpaid payments or attended status past the update date
      // const invalidTickets = await this.prismaService.ticketPurchase.updateMany(
      //   {
      //     where: {
      //       payment: {
      //         in: ['UN_PAID'], // Match pending and unpaid statuses
      //       },
      //       updateAt: {
      //         lte: today, // Only tickets updated before or on today
      //       },
      //     },
      //     data: {
      //       status: 'PAST_DUE', // Set status to past due
      //     },
      //   },
      // );

      // const invalidEventEndedTickets =
      //   await this.prismaService.ticketPurchase.updateMany({
      //     where: {
      //       payment: {
      //         in: ['PENDING'], // Match pending and unpaid statuses
      //       },
      //       ticket: {
      //         event: {
      //           status: 'ENDED',
      //         },
      //       },
      //       updateAt: {
      //         lte: today, // Only tickets updated before or on today
      //       },
      //     },
      //     data: {
      //       status: 'PAST_DUE', // Set status to past due
      //     },
      //   });
      // this.logger.log(`Invalidated Tickets: ${invalidTickets.count}`);
      // this.logger.log(
      //   `invalidate EventEnded Tickets: ${invalidEventEndedTickets.count}`,
      // );
    } catch (error) {
      // Log any error for debugging
      this.logger.error('Error occurred during CleanUp', error);
    }
  }
}
