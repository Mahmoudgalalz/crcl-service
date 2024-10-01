import {
  Controller,
  Post,
  Body,
  Get,
  UnauthorizedException,
  Res,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SuccessResponse } from 'src/common/success.response';
import { ErrorResponse } from 'src/common/error.response';
import { Public, Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/user.decorator';
import { Role } from '../interface/roles';
import { LoginAdminDto } from './dto/login-admin.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async superUserLogin(@Body() loginDto: LoginAdminDto, @Res() res: Response) {
    try {
      const { token, refresh } = await this.authService.validateSuperUser(
        loginDto.email,
        loginDto.password,
      );
      res.cookie('refreshToken', refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        domain:
          process.env.NODE_ENV !== 'development'
            ? process.env.domain
            : 'localhost',
      });
      res
        .send({ status: 'success', access_token: token })
        .status(HttpStatus.ACCEPTED);
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
