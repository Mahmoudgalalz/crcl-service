import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Event, Ticket } from '@prisma/client';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { newId } from 'src/common/uniqueId.utils';
import { CreateTicketDto, UpdateTicketDto } from './dto/tickets.dto';
import { PaginationProvider } from 'src/common/pagination/pagination.provider';
import { Paginated } from 'src/common/pagination/paginated.interface';

@Injectable()
export class EventsManagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationProvider: PaginationProvider,
  ) {}

  async createEvent(data: CreateEventDto): Promise<Event> {
    const id = newId('event', 16);
    return await this.prisma.event.create({
      data: {
        id,
        ...data,
      },
    });
  }

  async updateEvent(id: string, data: UpdateEventDto): Promise<Event> {
    return await this.prisma.event.update({
      where: { id },
      data,
    });
  }

  async listAllEvents(page: number, limit: number): Promise<Paginated<Event>> {
    const result = await this.paginationProvider.paginateQuery<Event>(
      page,
      limit,
      'event',
      {},
    );
    return result;
  }

  async getEventWithTickets(id: string): Promise<{ event: Event }> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { tickets: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return { event };
  }

  async createTicket(eventId: string, data: CreateTicketDto): Promise<Ticket> {
    const id = newId('ticket', 16);
    return await this.prisma.ticket.create({
      data: {
        id,
        ...data,
        event: {
          connect: {
            id: eventId,
          },
        },
      },
    });
  }

  async updateTicket(id: string, data: UpdateTicketDto): Promise<Ticket> {
    return await this.prisma.ticket.update({
      where: { id },
      data,
    });
  }
}
