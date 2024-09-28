import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, Roles } from '../decorators/roles.decorator';
import { SuccessResponse } from 'src/common/success.response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('admin/login')
  async superUserLogin(@Body() loginDto: { email: string; password: string }) {
    const superUser = await this.authService.validateSuperUser(
      loginDto.email,
      loginDto.password,
    );
    if (!superUser) {
      return { error: 'Invalid credentials' };
    }
    return new SuccessResponse('Token', { access_token: superUser });
  }

  @Public()
  @Post('user/login')
  async userLogin(@Body() loginDto: any) {
    const user = await this.authService.validateUserByEmail(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      return { error: 'Invalid credentials' };
    }
    return new SuccessResponse('Token', { access_token: user });
  }

  @Roles('admin')
  @Get('superuser/protected')
  getSuperUserProfile(@Request() req) {
    return req.user;
  }

  @Roles('user')
  @Post('user/protected')
  getUserProfile(@Request() req) {
    return req.user;
  }
}
