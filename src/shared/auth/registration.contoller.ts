import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { SuccessResponse } from 'src/common/success.response';
import { ErrorResponse } from 'src/common/error.response';
import { Public } from '../decorators/roles.decorator';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth/registration')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Public()
  @Post('register')
  async registerUser(@Body() registerDto: RegisterDto) {
    try {
      await this.registrationService.register(registerDto);
      return new SuccessResponse('OTP sent successfully');
    } catch (err) {
      return new ErrorResponse();
    }
  }

  @Public()
  @Post('verify')
  async verifyRegistration(@Body() verifyDto: VerifyOtpDto) {
    try {
      const token = await this.registrationService.verify(verifyDto.number, verifyDto.otp);
      return new SuccessResponse('Registration successful', { access_token: token });
    } catch (err) {
      throw new UnauthorizedException(err?.message || 'Verification failed');
    }
  }
}
