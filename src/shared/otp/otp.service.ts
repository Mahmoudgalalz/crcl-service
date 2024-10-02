/* eslint-disable prettier/prettier */
import { Injectable, Inject } from '@nestjs/common';
import * as crypto from 'crypto';
import Redis from 'ioredis'; 
@Injectable()
export class OTPService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis, 
  ) {}

  async generateOtp(number: string): Promise<string> {
    const otp = crypto.randomInt(100000, 999999).toString();
    await this.redisClient.set(`otp:${number}`, otp, 'EX', 4 * 60); 
    return otp;
  }

  async verifyOtp(number: string, otp: string): Promise<boolean> {
    const storedOtp = await this.redisClient.get(`otp:${number}`);
    if (!storedOtp || storedOtp !== otp) {
      return false; 
    }
    await this.redisClient.del(`otp:${number}`);
    return true;
  }
  async sendOtpToUser(number: string, otp: string): Promise<void> {
    // Implement your OTP sending logic (e.g., through an SMS service)
    console.log(`Sending OTP ${otp} to number ${number}`);
  }
}
