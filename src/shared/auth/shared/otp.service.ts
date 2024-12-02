import { Injectable, Inject, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import axios from 'axios';
import Redis from 'ioredis';
import { generateUniqueOtp } from 'src/common/uniqueId.utils';
import { SendOtpEvent } from 'src/services/email/events/sendOtp.event';
@Injectable()
export class OTPService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private emitter: EventEmitter2,
  ) {}

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
  async sendOtpToUser(
    data: { number: string; email: string; name: string },
    otp: string,
  ): Promise<void> {
    // Implement your OTP sending logic (e.g., through an SMS service)
    const service = process.env.OTP_SERVICE;
    if (service === 'SMS') {
      await this.sendSms(
        data.number,
        `Your Verfication code for \n Crcl Events is: ${otp}`,
      );
      console.log(`Sending OTP ${otp} to number ${data.number}`);
    } else {
      this.emitter.emit(
        'otp.request',
        new SendOtpEvent(data.email, { recipientName: data.name, otp: otp }),
      );
      console.log(`Sending OTP ${otp} to number ${data.email}`);
    }
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
