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
import { OTPService } from './shared/otp.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly otpService: OTPService,) { }

  @Public()
  @Post('admin/login')
  async superUserLogin(@Body() loginDto: { email: string; password: string }) {
    try {
      const { access_token, refresh_token } = await this.authService.validateSuperUser(
        loginDto.email,
        loginDto.password,
      );
      return new SuccessResponse('Token', { access_token,refresh_token });
    } catch (err) {
      throw new UnauthorizedException(err?.message, {
        cause: err,
        description: err,
      });
    }
  }

  @Public()
  @Post('user/login')
  async userLogin(@Body() loginDto: { email: string; password: string }) {
    try {
      const { access_token, refresh_token } = await this.authService.validateUserByEmail(
        loginDto.email,
        loginDto.password,
      );
      return new SuccessResponse('Token', { access_token, refresh_token });
    } catch (err) {
      throw new UnauthorizedException(err?.message, {
        cause: err,
        description: err,
      });
    }
  }

  @Get('info')
  @Roles(Role.Admin)
  getSuperUserProfile(@CurrentUser() user: any) {
    return user;
  }

  @Public()
  @Post('user/send-otp')
  async sendOtp(@Body() { number }: { number: string }) {
    try {
      const otp = await this.otpService.generateOtp(number);
      await this.otpService.sendOtpToUser(number, otp);
      return new SuccessResponse('OTP sent successfully');
    } catch (err) {
      return new ErrorResponse();
    }
  }

  @Public()
  @Post('user/verify-otp')
  async verifyOtp(@Body() { number, otp }: { number: string; otp: string }) {
    try {
      const { access_token, refresh_token } = await this.authService.validateUserByNumber(
        number,
        otp,
      );
      return new SuccessResponse('Token', { access_token, refresh_token });
    } catch (err) {
      throw new UnauthorizedException(err?.message, {
        cause: err,
        description: err,
      });
    }
  }
  @Public()
  @Post('register')
  async registerUser(@Body() registerDto: RegisterDto) {
    try {
      await this.authService.register(registerDto);
      return new SuccessResponse('OTP sent successfully');
    } catch (err) {
      console.log(err);

      return new ErrorResponse();
    }
  }

  @Public()
  @Post('verify')
  async verifyRegistration(@Body() verifyDto: VerifyOtpDto) {
    try {
      const { access_token, refresh_token } = await this.authService.verify(verifyDto.number, verifyDto.otp);
      return new SuccessResponse('Token', { access_token, refresh_token });
    } catch (err) {
      throw new UnauthorizedException(err?.message || 'Verification failed');
    }
  }
}
