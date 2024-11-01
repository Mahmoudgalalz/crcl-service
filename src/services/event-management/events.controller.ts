import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  Patch,
  ParseIntPipe,
  Delete,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { EventsManagementService } from './events.service';
import {
  ChangeRequestDto,
  CreateEventDto,
  UpdateEventDto,
} from './dto/event.dto';
import { CreateTicketDto, UpdateTicketDto } from './dto/tickets.dto';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/interface/roles';
import { SuccessResponse } from 'src/common/success.response';
import { ErrorResponse } from 'src/common/error.response';
import { Response } from 'express';

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
  async getAllEventsWithTickets(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    try {
      const { pageNumber, limitNumber } = {
        pageNumber: parseInt(page),
        limitNumber: parseInt(limit),
      };
      const events = await this.eventsService.listAllEvents(
        pageNumber,
        limitNumber,
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

  @Get(':eventId/requests')
  async getRequest(
    @Param('eventId') id: string,
    @Query('search') search?: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    try {
      if (search) {
        const requests = await this.eventsService.searchEventRequests(
          id,
          page,
          limit,
        );
        return new SuccessResponse(`result of ${search} in Requests`, requests);
      }
      const requests = await this.eventsService.getEventRequests(
        id,
        page,
        limit,
      );
      return new SuccessResponse('All Event Requests', requests);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Patch('requests/:id')
  async changeRequestStatus(
    @Param('id') id: string,
    @Body() data: ChangeRequestDto,
  ) {
    try {
      const changeStatus = await this.eventsService.changeRequest(
        id,
        data.userId,
        data.status,
      );
      if (changeStatus)
        return new SuccessResponse('Request Status Changed', changeStatus);
      return new ErrorResponse();
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

  @Delete('tickets/:id')
  async deleteTicket(@Param('id') ticketId: string, @Res() res: Response) {
    try {
      const isBooked = await this.eventsService.checkIfTicketBooked(ticketId);
      if (isBooked) {
        return res.status(HttpStatus.NOT_ACCEPTABLE).send({
          status: 'error',
          message: 'Ticket already booked',
        });
      }
      const ticket = await this.eventsService.deleteTicket(ticketId);
      return new SuccessResponse('Ticket Deleted', ticket);
    } catch (error) {
      throw new ErrorResponse();
    }
  }
}
