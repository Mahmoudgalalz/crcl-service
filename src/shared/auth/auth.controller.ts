import {
  Controller,
  Post,
  Body,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SuccessResponse } from 'src/common/success.response';
import { ErrorResponse } from 'src/common/error.response';
import { Public, Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/user.decorator';
import { Role } from '../interface/roles';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('admin/login')
  async superUserLogin(@Body() loginDto: { email: string; password: string }) {
    try {
      const superUser = await this.authService.validateSuperUser(
        loginDto.email,
        loginDto.password,
      );
      return new SuccessResponse('Token', { access_token: superUser });
    } catch (err) {
      throw new UnauthorizedException(err?.message, {
        cause: err,
        description: err,
      });
    }
  }

  @Public()
  @Post('user/login')
  async userLogin(@Body() loginDto: any) {
    const user = await this.authService.validateUserByEmail(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      return new ErrorResponse();
    }
    return new SuccessResponse('Token', { access_token: user });
  }
  @Get('info')
  @Roles(Role.Admin)
  getSuperUserProfile(@CurrentUser() user: any) {
    return user;
  }
}