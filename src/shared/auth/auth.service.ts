import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { OTPService } from './shared/otp.service';
import { JWTService } from './shared/jwt.service';
import { BcryptService } from './shared/bcrypt.service';
import Redis from 'ioredis';
import { RegisterDto } from './dto/register.dto';
import { customUUID } from 'src/common/uniqueId.utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JWTService,
    private readonly prisma: PrismaService,
    private readonly otpService: OTPService,
    private readonly bycrptService: BcryptService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  async validateSuperUser(email: string, pass: string) {
    const user = await this.prisma.superUser.findFirst({ where: { email } });
    if (user) {
      const isCorrect = await this.bycrptService.comparePassword(
        pass,
        user.password,
      );
      if (user && isCorrect) {
        return await this.jwtService.createTokens({
          email: user.email,
          userId: user.id,
          role: 'admin',
        });
      }
      throw "Error, couldn't find the user";
    }
  }

  async validateUserByEmail(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });
    const validPassword = await this.bycrptService.comparePassword(
      pass,
      user.password,
    );
    if (user && validPassword) {
      return await this.jwtService.createTokens({
        email: user.email,
        userId: user.id,
        role: 'user',
      });
    }

    throw new Error("Error, couldn't find the user");
  }

  async validateUserByNumber(number: string, otp: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: { number },
    });

    if (user && (await this.otpService.verifyOtp(number, otp))) {
      return await this.jwtService.createTokens({
        email: user.email,
        userId: user.id,
        role: 'user',
      });
    }
    throw new Error("Error, couldn't verify the user with OTP");
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: registerDto.email }, { number: registerDto.number }],
      },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email or Number already in use');
    }

    const hashedPassword = await this.bycrptService.hashPassword(
      registerDto.password,
    );
    const cachedData = { ...registerDto, password: hashedPassword };
    await this.redisClient.set(
      `${registerDto.number}`,
      JSON.stringify(cachedData),
      'EX',
      300,
    );

    const otp = await this.otpService.generateOtp(registerDto.number);
    await this.otpService.sendOtpToUser(registerDto.number, otp);
  }

  async verify(number: string, otp: string) {
    const isValidOtp = await this.otpService.verifyOtp(number, otp);
    if (!isValidOtp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const cachedDataString = await this.redisClient.get(`${number}`);
    if (!cachedDataString) {
      throw new UnauthorizedException('No registration data found');
    }

    await this.redisClient.del(`${number}`);

    const cachedData = JSON.parse(cachedDataString);

    const id = customUUID(20);
    const user = await this.prisma.user.create({
      data: {
        id: id,
        email: cachedData.email,
        number: cachedData.number,
        password: cachedData.password,
        facebook: cachedData.facebook,
        instagram: cachedData.instagram,
        gender: cachedData.gender,
        type: 'USER',
        status: 'ACTIVE',
      },
    });

    return await this.jwtService.createTokens({
      email: user.email,
      userId: user.id,
      role: 'user',
    });
  }
}
