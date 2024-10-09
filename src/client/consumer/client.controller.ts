import { Controller, Get, Param, Query } from '@nestjs/common';
import { SuccessResponse } from 'src/common/success.response';
import { ErrorResponse } from 'src/common/error.response';
import { Role } from 'src/shared/interface/roles';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { ClientService } from './client.service';

@Controller('client')
@Roles(Role.User)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('newspapers')
  async getAllNewspapers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    try {
      const { pageNumber, limitNumber } = {
        pageNumber: parseInt(page),
        limitNumber: parseInt(limit),
      };
      const newspapers = await this.clientService.listNewspapers(
        pageNumber,
        limitNumber,
      );
      return new SuccessResponse('All Newspapers', newspapers);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Get('newspapers/:id')
  async getNewspaper(@Param('id') newspaperId: string) {
    try {
      const newspaper = await this.clientService.getNewspaper(newspaperId);
      return new SuccessResponse('Newspaper data', newspaper);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Get('events')
  async getAllEventsWithTickets(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    try {
      const { pageNumber, limitNumber } = {
        pageNumber: parseInt(page),
        limitNumber: parseInt(limit),
      };
      const events = await this.clientService.listAllEvents(
        pageNumber,
        limitNumber,
      );
      return new SuccessResponse('all events', events);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Get('events/:id')
  async getEventWithTickets(@Param('id') eventId: string) {
    try {
      const events = await this.clientService.getEventWithTickets(eventId);
      return new SuccessResponse('Events data with tickets', events);
    } catch (error) {
      return new ErrorResponse();
    }
  }
}
