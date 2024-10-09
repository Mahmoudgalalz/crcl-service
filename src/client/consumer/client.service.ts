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

  async listNewspapers(
    page: number,
    limit: number,
  ): Promise<{ newspapers: Newspaper[]; total: number }> {
    const [newspapers, total] = await this.prisma.$transaction([
      this.prisma.newspaper.findMany({
        where: {
          status: 'PUBLISHED',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.newspaper.count(),
    ]);
    return { newspapers, total };
  }

  async listAllEvents(
    page: number,
    limit: number,
  ): Promise<{ events: Event[]; total: number }> {
    const [events, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        where: {
          status: 'PUBLISHED',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.event.count(),
    ]);
    return { events, total };
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
