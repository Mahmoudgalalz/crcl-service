import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Event, Newspaper, Ticket } from '@prisma/client';

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
      where: { id: userId },
      select: { favoriteEvents: true },
    });

    const [UserFavoriteEvents, events, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        where: { status: 'PUBLISHED', id: { in: favoriteEvents } },
        include: { tickets: true },
      }),
      this.prisma.event.findMany({
        where: { status: 'PUBLISHED', id: { notIn: favoriteEvents } },
        include: { tickets: true },
      }),
      this.prisma.event.count({ where: { status: 'PUBLISHED' } }),
    ]);

    // Compute remaining capacity
    const calculateRemainingCapacity = async (events: Event[]) => {
      return Promise.all(
        events.map(async (event) => {
          const ticketsSold = await this.prisma.ticketPurchase.count({
            where: { ticket: { eventId: event.id } },
          });
          return {
            ...event,
            remainingCapacity: event.capacity - ticketsSold,
          };
        }),
      );
    };

    const enrichedUserFavoriteEvents =
      await calculateRemainingCapacity(UserFavoriteEvents);
    const enrichedEvents = await calculateRemainingCapacity(events);

    return {
      UserFavoriteEvents: enrichedUserFavoriteEvents,
      events: enrichedEvents,
      total,
    };
  }

  async listAllEventsPublic() {
    const [events, total] = await this.prisma.$transaction([
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
    return { events, total };
  }

  async getEventWithTickets(id: string): Promise<{
    event: Event & { tickets: (Ticket & { remainingCapacity: number })[] };
  }> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        tickets: {
          where: {
            deletedAt: {
              equals: null,
            },
          },
        },
      },
    });

    if (!event || event.status !== 'PUBLISHED') {
      throw new NotFoundException('Event not found');
    }

    // Calculate remaining capacity for each ticket
    const ticketsWithRemainingCapacity = await Promise.all(
      event.tickets.map(async (ticket) => {
        const ticketsSold = await this.prisma.ticketPurchase.count({
          where: { ticketId: ticket.id },
        });

        return {
          ...ticket,
          remainingCapacity: ticket.capacity - ticketsSold,
        };
      }),
    );

    return { event: { ...event, tickets: ticketsWithRemainingCapacity } };
  }
}
