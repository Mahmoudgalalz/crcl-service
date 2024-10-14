import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { SuccessResponse } from 'src/common/success.response';
import { ErrorResponse } from 'src/common/error.response';
import { Role } from 'src/shared/interface/roles';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserService } from './user.service';
import { UserUpdateDto } from './dto/user-update.dto';
import { CurrentUser } from 'src/shared/decorators/user.decorator';
import { User } from '@prisma/client';
import { MetaRequestDto } from './dto/events.dto';

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
      return new ErrorResponse();
    }
  }

  @Get('wallet')
  @Roles(Role.Reader, Role.User)
  async walletInfo(@CurrentUser() user: User) {
    try {
      const updatedUser = await this.userService.UserWallet(user.id);
      return new SuccessResponse('Updated User', updatedUser);
    } catch (error) {
      return new ErrorResponse();
    }
  }

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
      return new ErrorResponse();
    }
  }
  @Get('requests')
  @Roles(Role.User)
  async getBookTickets(@CurrentUser() user: User) {
    try {
      const tickets = await this.userService.userTicketsToBuy(user.id);
      return new SuccessResponse('User Tickets', tickets);
    } catch (error) {
      return new ErrorResponse();
    }
  }
}
