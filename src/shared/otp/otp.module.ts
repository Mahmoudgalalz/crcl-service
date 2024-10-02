/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { OTPService } from './otp.service';

@Module({
  imports: [],
  providers: [OTPService],
  exports: [OTPService], // Export OtpService to use in other modules
})
export class OtpModule {}
