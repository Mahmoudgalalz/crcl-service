import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Event, Newspaper } from '@prisma/client';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}

  async getNewspaper(id: string): Promise<Newspaper> {
    const newspaper = await this.prisma.newspaper.findUnique({
      where: { id, status: 'PUBLISHED' },
    });
    if (!newspaper) {
      throw new NotFoundException('Newspaper not found');
    }
    return newspaper;
  }

  async listNewspapers(): Promise<{ newspapers: Newspaper[]; total: number }> {
    const [newspapers, total] = await this.prisma.$transaction([
      this.prisma.newspaper.findMany({
        where: {
          status: 'PUBLISHED',
        },
      }),
      this.prisma.newspaper.count({
        where: {
          status: 'PUBLISHED',
        },
      }),
    ]);
    return { newspapers, total };
  }

  async listAllEvents(userId: string) {
    const { favoriteEvents } = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    const [UserFavoriteEvents, events, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        where: {
          status: 'PUBLISHED',
          id: {
            in: favoriteEvents,
          },
        },
      }),
      this.prisma.event.findMany({
        where: {
          status: 'PUBLISHED',
          id: {
            notIn: favoriteEvents,
          },
        },
      }),
      this.prisma.event.count({
        where: {
          status: 'PUBLISHED',
        },
      }),
    ]);
    return { UserFavoriteEvents, events, total };
  }

  async listAllEventsPublic() {
    const [UserFavoriteEvents, events, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        where: {
          status: 'PUBLISHED',
        },
      }),
      this.prisma.event.findMany({
        where: {
          status: 'PUBLISHED',
        },
      }),
      this.prisma.event.count({
        where: {
          status: 'PUBLISHED',
        },
      }),
    ]);
    return { UserFavoriteEvents, events, total };
  }

  async getEventWithTickets(id: string): Promise<{ event: Event }> {
    const event = await this.prisma.event.findUnique({
      where: { id, status: 'PUBLISHED' },
      include: { tickets: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return { event };
  }
}
