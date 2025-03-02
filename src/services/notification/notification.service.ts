import { Injectable, NotFoundException } from '@nestjs/common';
import { customUUID } from 'src/common/uniqueId.utils';
import { PrismaService } from 'src/prisma.service';
import {
  sendNotificationToDevice,
  sendNotificationToMultipleDevices,
  sendNotificationToTopic,
  subscribeMultipleUsersToTopic,
} from './firebase.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; description: string }) {
    const id = customUUID(10);
    return this.prisma.notifications.create({
      data: {
        id,
        ...data,
      },
    });
  }

  async findAll() {
    return this.prisma.notifications.findMany();
  }

  async findOne(id: string) {
    const notification = await this.prisma.notifications.findUnique({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID "${id}" not found`);
    }
    return notification;
  }

  async update(id: string, data: { name?: string; description?: string }) {
    await this.findOne(id);
    return this.prisma.notifications.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.notifications.delete({
      where: { id },
    });
  }

  async addUserToNoticationGroup(usersIds: string[], notificationId: string) {
    const notification = await this.prisma.notifications.update({
      where: {
        id: notificationId,
      },
      data: {
        users: {
          connect: usersIds.map((id) => ({ id })),
        },
      },
      include: {
        users: {
          select: {
            notificationToken: true,
          },
        },
      },
    });
    const notificationTokens = notification.users.map((user) => {
      return user.notificationToken;
    });
    const firebaseIntegration = await subscribeMultipleUsersToTopic(
      notificationTokens,
      notification.id,
    );
    return { notification, firebaseIntegration };
  }

  async removeUserFromNotificationGroup(
    usersIds: string[],
    notificationId: string,
  ) {
    const notification = await this.prisma.notifications.update({
      where: {
        id: notificationId,
      },
      data: {
        users: {
          disconnect: usersIds.map((id) => ({ id })),
        },
      },
      include: {
        users: {
          select: {
            notificationToken: true,
          },
        },
      },
    });
    const notificationTokens = notification.users.map((user) => {
      return user.notificationToken;
    });
    const firebaseIntegration = await subscribeMultipleUsersToTopic(
      notificationTokens,
      notification.id,
    );
    return { notification, firebaseIntegration };
  }

  async pushNotification(
    userId: string,
    payload: { title: string; body: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (user.notificationToken) {
      return await sendNotificationToDevice(user.notificationToken, payload);
    }
    throw Error("User doesn't have a notification token installed");
  }

  async bulkPushNotifiaction(payload: {
    title: string;
    message: string;
    notificationId?: string;
    userIds?: string[];
  }) {
    if (payload.notificationId) {
      const result = await sendNotificationToTopic(payload.notificationId, {
        title: payload.title,
        body: payload.message,
      });
      return result;
    }
    if (payload.userIds) {
      const users = await this.prisma.user.findMany({
        where: {
          id: {
            in: payload.userIds,
          },
        },
        select: {
          notificationToken: true,
        },
      });
      const notificationTokens = users.map((user) => {
        return user.notificationToken;
      });
      const result = await sendNotificationToMultipleDevices(
        notificationTokens,
        {
          title: payload.title,
          body: payload.message,
        },
      );
      return result;
    }

    return payload;
  }
}
