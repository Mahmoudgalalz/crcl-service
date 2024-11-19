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
      `Your Verfication code for Crcl Events is ${otp}`,
    );
  }

  private async sendSms(to: string, message: string) {
    try {
      const result = await axios.post(
        'https://api.sms.to/sms/send',
        {
          message,
          to,
          sender_id: 'Crcl Events',
        },
        {
          headers: {
            Authorization: process.env.OTP_KEY,
          },
        },
      );
      const response = `Sending a message to ${to} response: ${result.status}, ${result.data}`;
      Logger.log(response, 'OTP Service');
    } catch (err) {
      Logger.error(err);
    }
  }
}
