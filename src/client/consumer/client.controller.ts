import { Controller, Get, Param } from '@nestjs/common';
import { SuccessResponse } from 'src/common/success.response';
import { ErrorResponse } from 'src/common/error.response';
import { Public } from 'src/shared/decorators/roles.decorator';
import { ClientService } from './client.service';
import { CurrentUser } from 'src/shared/decorators/user.decorator';

@Controller('client')
@Public()
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('newspapers')
  async getAllNewspapers() {
    try {
      // const { pageNumber, limitNumber } = {
      //   pageNumber: parseInt(page),
      //   limitNumber: parseInt(limit),
      // };
      const newspapers = await this.clientService.listNewspapers();
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
  async getAllEventsWithTickets(@CurrentUser() user: any) {
    try {
      if (user.userId) {
        const events = await this.clientService.listAllEvents(user.userId);
        return new SuccessResponse('all events', events);
      }
      const events = await this.clientService.listAllEventsPublic();
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
