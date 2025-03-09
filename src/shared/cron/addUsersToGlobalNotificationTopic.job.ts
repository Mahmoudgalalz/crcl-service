import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';
import { subscribeMultipleUsersToTopic } from 'src/services/notification/firebase.service';

@Injectable()
export class GlobalNotificationTopic {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(GlobalNotificationTopic.name);

  @Cron(CronExpression.EVERY_3_HOURS, {
    name: 'Global Notification Topic',
    timeZone: 'Africa/Cairo',
  })
  async handleCron() {
    this.logger.debug('GlobalNotificationTopic starting');

    try {
      const users = await this.prismaService.user.findMany();
      const userIds = users.map((user) => user.id);
      const staticId = 'global';

      const notification = await this.prismaService.notifications.upsert({
        where: {
          id: staticId,
        },
        update: {
          users: {
            connect: userIds.map((id) => ({ id })),
          },
        },
        create: {
          name: 'Global',
          id: staticId,
          description: 'Global Notification Topic',
          users: {
            connect: userIds.map((id) => ({ id })),
          },
        },
        include: {
          users: true,
        },
      });

      const firebase = await subscribeMultipleUsersToTopic(
        notification.users
          .map((user) => (user.notificationToken ? user.notificationToken : ''))
          .filter((token) => token !== ''),
        staticId,
      );
      this.logger.log(
        `Subs users to GlobalNotification Events: ${userIds.length}`,
      );

      this.logger.log(`Send to firebase tokens status: ${firebase.status}`);
      this.logger.log(`Send to firebase tokens response: ${firebase.response}`);
      this.logger.log(`Send to firebase tokens errors: ${firebase.error}`);
    } catch (error) {
      // Log any error for debugging
      this.logger.error('Error occurred during GlobalNotificationTopic', error);
    }
  }
}
