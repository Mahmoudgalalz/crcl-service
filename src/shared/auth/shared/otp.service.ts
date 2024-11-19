import { Injectable, Inject, Logger } from '@nestjs/common';
import axios from 'axios';
import Redis from 'ioredis';
import { generateUniqueOtp } from 'src/common/uniqueId.utils';
@Injectable()
export class OTPService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async generateOtp(number: string): Promise<string> {
    const otp = generateUniqueOtp();
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
    await this.sendSms(
      number,
      `Your Verfication code for \n Crcl Events is: ${otp}`,
    );
  }

  private async sendSms(to: string, message: string) {
    try {
      const body = {
        message,
        to,
        sender_id: 'CRCL',
        bypass_optout: true,
      };
      const result = await axios.post('https://api.sms.to/sms/send', body, {
        headers: {
          Authorization: `Bearer ${process.env.OTP_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      Logger.log(result.data, 'OTP Service');
      return {
        status: 'success',
        message: `Message sent successfully to ${to}`,
        data: result.data,
      };
    } catch (error) {
      Logger.error(
        `Failed to send message to ${to}: ${error.message}`,
        error.stack,
        'OTP Service',
      );
      return {
        status: 'error',
        message: `Failed to send message to ${to}`,
        error: error.response?.data || error.message,
      };
    }
  }
}
