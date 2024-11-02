import {
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Event, RequestStatus, Ticket } from '@prisma/client';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { newId } from 'src/common/uniqueId.utils';
import { CreateTicketDto, UpdateTicketDto } from './dto/tickets.dto';

@Injectable()
export class EventsManagementService {
  constructor(private readonly prisma: PrismaService) {}

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

  async listAllEvents(
    page: number,
    limit: number,
  ): Promise<{ events: Event[]; total: number }> {
    const [events, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.event.count(),
    ]);
    return { events, total };
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

  async deleteTicket(id: string): Promise<Ticket> {
    return await this.prisma.ticket.delete({
      where: { id },
    });
  }

  async getEventRequests(
    eventId: string,
    page: number = 1,
    pageSize: number = 10,
  ) {
    const skip = (page - 1) * pageSize;

    const requests = await this.prisma.eventRequest.findMany({
      where: { eventId },
      include: {
        user: true,
      },
      skip,
      take: pageSize,
    });

    const totalRequests = await this.prisma.eventRequest.count({
      where: { eventId },
    });

    return {
      data: requests,
      meta: {
        total: totalRequests,
        page,
        pageSize,
        totalPages: Math.ceil(totalRequests / pageSize),
      },
    };
  }

  async searchEventRequests(
    eventId: string,
    page: number = 1,
    pageSize: number = 10,
    searchQuery: string = '',
  ) {
    const skip = (page - 1) * pageSize;

    const requests = await this.prisma.eventRequest.findMany({
      where: {
        eventId,
        user: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { number: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
      },
      include: {
        user: true,
      },
      skip,
      take: pageSize,
    });

    const totalRequests = await this.prisma.eventRequest.count({
      where: {
        eventId,
        user: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { number: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
      },
    });

    return {
      data: requests,
      meta: {
        total: totalRequests,
        page,
        pageSize,
        totalPages: Math.ceil(totalRequests / pageSize),
      },
    };
  }

  async changeRequest(
    requestId: string,
    userId: string,
    status: RequestStatus,
  ) {
    try {
      if (status === 'APPROVED') {
        const request = await this.changeRequestStatus(requestId, status);
        const formatedData = this.createTicketsArray(userId, request.meta);
        await this.prisma.ticketPurchase.createMany({
          data: formatedData,
        });
        return true;
      } else {
        const request = await this.changeRequestStatus(requestId, status);
        const formatedData = this.createTicketIdsArray(request.meta);
        await this.prisma.ticketPurchase.deleteMany({
          where: {
            userId,
            ticketId: formatedData,
          },
        });
        return true;
      }
    } catch (err) {
      Logger.log('Request Status err: ', err);
      return false;
    }
  }

  async checkIfTicketBooked(ticketId: string) {
    const ticket = await this.prisma.ticketPurchase.findFirst({
      where: {
        ticketId,
      },
    });
    const isInEventReq = await this.prisma.eventRequest.findFirst({
      where: {
        meta: {
          equals: {
            ticketId,
          },
        },
      },
    });
    if (ticket || isInEventReq) {
      throw new NotAcceptableException('Ticket already booked');
    }
    return true;
  }

  private async changeRequestStatus(requestId: string, status: RequestStatus) {
    const requestState = await this.prisma.eventRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status,
      },
    });
    return requestState;
  }

  private createTicketsArray(userId: string, data: any) {
    let output;
    if (Array.isArray(data)) {
      data.forEach((elem) => {
        output = {
          id: newId('ticket', 16),
          userId,
          payment: 'PENDING',
          status: 'UPCOMMING',
          meta: elem.meta,
          ticketId: elem.ticketId,
        };
      });
    }
    return output;
  }

  private createTicketIdsArray(data: any) {
    let output;
    if (typeof data === 'object') {
      data.forEach((elem) => {
        output = {
          ticketId: elem.ticketId,
        };
      });
    }
    return output;
  }
}
