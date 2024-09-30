import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { EventsManagementService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { CreateTicketDto, UpdateTicketDto } from './dto/tickets.dto';
import { Event, Ticket } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/interface/roles';

@ApiTags('events')
@Controller('events')
@Roles(Role.Admin)
export class EventsManagementController {
  constructor(private readonly eventsService: EventsManagementService) {}

  @Post()
  async createEvent(@Body() data: CreateEventDto): Promise<Event> {
    return this.eventsService.createEvent(data);
  }

  @Put(':id')
  async updateEvent(
    @Param('id') eventId: string,
    @Body() data: UpdateEventDto,
  ): Promise<Event> {
    return this.eventsService.updateEvent(eventId, data);
  }

  @Get(':id')
  async getEventWithTickets(@Param('id') eventId: string) {
    return this.eventsService.getEventWithTickets(eventId);
  }

  @Post(':eventId/tickets')
  async createTicket(
    @Param('eventId') eventId: string,
    @Body() data: CreateTicketDto,
  ): Promise<Ticket> {
    return this.eventsService.createTicket(eventId, data);
  }

  @Put('tickets/:id')
  async updateTicket(
    @Param('id') ticketId: string,
    @Body() data: UpdateTicketDto,
  ): Promise<Ticket> {
    return this.eventsService.updateTicket(ticketId, data);
  }
}
