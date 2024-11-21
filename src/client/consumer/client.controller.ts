import { Controller, Get, Logger, Param } from '@nestjs/common';
import { SuccessResponse } from 'src/common/success.response';
import { ErrorResponse } from 'src/common/error.response';
import { ClientService } from './client.service';
import { CurrentUser } from 'src/shared/decorators/user.decorator';
import { User } from '@prisma/client';
import { Public, Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/interface/roles';
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('newspapers')
  @Public()
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
  @Public()
  async getNewspaper(@Param('id') newspaperId: string) {
    try {
      const newspaper = await this.clientService.getNewspaper(newspaperId);
      return new SuccessResponse('Newspaper data', newspaper);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Get('events')
  @Roles(Role.User)
  async getAllEventsUser(@CurrentUser() user: User) {
    try {
      Logger.log(user);
      const events = await this.clientService.listAllEvents(user.id);
      return new SuccessResponse('all events', events);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Get('public/events')
  @Public()
  async getAllEvents() {
    try {
      const events = await this.clientService.listAllEventsPublic();
      return new SuccessResponse('all events', events);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Get('events/:id')
  @Public()
  async getEventWithTickets(@Param('id') eventId: string) {
    try {
      const events = await this.clientService.getEventWithTickets(eventId);
      return new SuccessResponse('Events data with tickets', events);
    } catch (error) {
      return new ErrorResponse();
    }
  }
}
