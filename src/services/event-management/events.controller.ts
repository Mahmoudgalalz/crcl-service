import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { EventsManagementService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { CreateTicketDto, UpdateTicketDto } from './dto/tickets.dto';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/interface/roles';
import { SuccessResponse } from 'src/common/success.response';
import { ErrorResponse } from 'src/common/error.response';
import { PaginationQueryDto } from 'src/common/pagination-query-dto';

@ApiTags('events')
@Controller('events')
@Roles(Role.Admin)
export class EventsManagementController {
  constructor(private readonly eventsService: EventsManagementService) {}

  @Post()
  async createEvent(@Body() data: CreateEventDto) {
    try {
      const event = await this.eventsService.createEvent(data);
      return new SuccessResponse('Created Event', event);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Get()
  async getAllEventsWithTickets(@Query()query: PaginationQueryDto) {
    try {
      const { page, limit } = query;
      const events = await this.eventsService.listAllEvents(
        page,
        limit,
      );
      return new SuccessResponse('all events', events);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Put(':id')
  async updateEvent(
    @Param('id') eventId: string,
    @Body() data: UpdateEventDto,
  ) {
    try {
      const event = await this.eventsService.updateEvent(eventId, data);
      return new SuccessResponse('Updated Event', event);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Get(':id')
  async getEventWithTickets(@Param('id') eventId: string) {
    try {
      const events = await this.eventsService.getEventWithTickets(eventId);
      return new SuccessResponse('Events data with tickets', events);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Post(':eventId/tickets')
  async createTicket(
    @Param('eventId') eventId: string,
    @Body() data: CreateTicketDto,
  ) {
    try {
      const ticket = await this.eventsService.createTicket(eventId, data);
      return new SuccessResponse('Ticket data', ticket);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Put('tickets/:id')
  async updateTicket(
    @Param('id') ticketId: string,
    @Body() data: UpdateTicketDto,
  ) {
    try {
      const ticket = await this.eventsService.updateTicket(ticketId, data);
      return new SuccessResponse('Ticket Updated', ticket);
    } catch (error) {
      return new ErrorResponse();
    }
  }
}
