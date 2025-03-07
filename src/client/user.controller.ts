import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { SuccessResponse } from 'src/common/success.response';
import { ErrorResponse } from 'src/common/error.response';
import { Role } from 'src/shared/interface/roles';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserService } from './user.service';
import { UserUpdateDto } from './dto/user-update.dto';
import { CurrentUser } from 'src/shared/decorators/user.decorator';
import { User } from '@prisma/client';
import { MetaRequestDto } from './dto/events.dto';
import { TicketsTransactionDTO } from './dto/wallet.dto';

@Controller('client/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put()
  @Roles(Role.Booth, Role.Reader, Role.User)
  async updateUserInfo(@CurrentUser() user: User, @Body() data: UserUpdateDto) {
    try {
      const updatedUser = await this.userService.update(user.id, data);
      return new SuccessResponse('Updated User', updatedUser);
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_FOUND);
    }
  }
  @Get()
  @Roles(Role.Booth, Role.Reader, Role.User)
  async getUserInfo(@CurrentUser() user: User) {
    try {
      const userData = await this.userService.get(user.id);
      return new SuccessResponse('All User information', userData);
    } catch (error) {
      return new ErrorResponse();
    }
  }
  //! fix this issue related to events and add validation
  @Post('requests/:eventId')
  @Roles(Role.User)
  async bookTickets(
    @CurrentUser() user: User,
    @Param('eventId') eventId: string,
    @Body() data: MetaRequestDto[],
  ) {
    try {
      const bookEvent = await this.userService.userInitTicketRequest(
        user.id,
        eventId,
        data,
      );
      return new SuccessResponse('User Booked Event', bookEvent);
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_FOUND);
    }
  }

  @Get('wallet')
  @Roles(Role.User, Role.Booth)
  async walletInfo(@CurrentUser() user: User) {
    try {
      const userWallet = await this.userService.UserWallet(user.id);
      return new SuccessResponse('User Wallet info', userWallet);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Post('events/:id')
  @Roles(Role.User)
  async addfavoriteEvents(
    @CurrentUser() user: User,
    @Param('id') eventId: string,
  ) {
    try {
      const add = await this.userService.addFavoriteEvent(user.id, eventId);
      return new SuccessResponse('Add Event to Favorite list', add);
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_FOUND);
    }
  }

  @Delete('events/:id')
  @Roles(Role.User)
  async removefavoriteEvents(
    @CurrentUser() user: User,
    @Param('id') eventId: string,
  ) {
    try {
      const add = await this.userService.removeFavoriteEvent(user.id, eventId);
      return new SuccessResponse('Add Event to Favorite list', add);
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_FOUND);
    }
  }

  @Post('tickets/pay')
  @Roles(Role.User)
  async userPayTickets(
    @CurrentUser() user: User,
    @Body() payload: TicketsTransactionDTO,
  ) {
    try {
      const transaction = await this.userService.userPayTickets(
        user.id,
        payload.ticketsIds,
        payload.callback,
      );
      return new SuccessResponse('Tickets Payment URL', transaction);
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_FOUND);
    }
  }

  @Post('wallet/pay/:id')
  @Roles(Role.User)
  async payWithWallet(@CurrentUser() user: User, @Param('id') id: string) {
    try {
      const transaction = await this.userService.userCompeleteTransaction(
        user.id,
        id,
      );
      return new SuccessResponse('Transaction attempet', transaction);
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_FOUND);
    }
  }

  @Get('tickets')
  @Roles(Role.User)
  async userTicketsToPay(@CurrentUser() user: User) {
    try {
      const tickets = await this.userService.userTickets(user.id);
      const requests = await this.userService.userRequests(user.id);
      return new SuccessResponse('Tickets and requests', { tickets, requests });
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_FOUND);
    }
  }

  @Delete('')
  @Roles(Role.User)
  async userDelete(@CurrentUser() user: User) {
    try {
      const deleted = await this.userService.deleteUser(user.id);
      return new SuccessResponse('Desactivate Account', deleted);
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_FOUND);
    }
  }
}
