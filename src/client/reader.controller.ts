import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { SuccessResponse } from 'src/common/success.response';
import { Role } from 'src/shared/interface/roles';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserService } from './user.service';

@Controller('client/reader')
@Roles(Role.Reader)
export class ReaderController {
  constructor(private readonly userService: UserService) {}

  @Post('tickets/:id')
  async initTransactions(@Param('id') id: string) {
    try {
      if (id.startsWith('inv')) {
        const ticket = await this.userService.readerTicketInvitationOps(id);
        return new SuccessResponse('Ticket information', ticket);
      } else {
        const approveTicket = await this.userService.readerTicketOps(id);
        return new SuccessResponse(
          'Ticket approved successfully',
          approveTicket,
        );
      }
    } catch (error) {
      if (error.message === 'Ticket is already used or past due') {
        throw new HttpException(error, HttpStatus.CONFLICT);
      } else if (error.message === 'Ticket not found') {
        throw new HttpException(error, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get('tickets/:id')
  async walletInfo(@Param('id') id: string) {
    try {
      if (id.startsWith('inv')) {
        const ticket = await this.userService.readerTicketInvitationScan(id);
        return new SuccessResponse('Ticket information', ticket);
      } else {
        const ticket = await this.userService.readerTicketScan(id);
        return new SuccessResponse('Ticket information', ticket);
      }
    } catch (error) {
      if (error.message === 'Ticket not found') {
        throw new HttpException(error, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
