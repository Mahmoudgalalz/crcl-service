import { Injectable, NotFoundException } from '@nestjs/common';
import { customUUID } from 'src/common/uniqueId.utils';
import { PrismaService } from 'src/prisma.service';

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
}
