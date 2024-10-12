import { Body, Controller, Get, Put } from '@nestjs/common';
import { SuccessResponse } from 'src/common/success.response';
import { ErrorResponse } from 'src/common/error.response';
import { Role } from 'src/shared/interface/roles';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserService } from './user.service';
import { UserUpdateDto } from './dto/user-update.dto';
import { CurrentUser } from 'src/shared/decorators/user.decorator';
import { User } from '@prisma/client';

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
  @Roles(Role.Booth, Role.Reader, Role.User)
  async walletInfo(@CurrentUser() user: User) {
    try {
      const updatedUser = await this.userService.UserWallet(user.id);
      return new SuccessResponse('Updated User', updatedUser);
    } catch (error) {
      return new ErrorResponse();
    }
  }
}
