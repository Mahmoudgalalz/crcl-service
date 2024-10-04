import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { OTPService } from './shared/otp.service';
import { JWTService } from './shared/jwt.service';
import { BcryptService } from './shared/bcrypt.service';
import { Redis } from 'ioredis';
import { RegisterDto } from './dto/register.dto';
import { customUUID } from 'src/common/uniqueId.utils';

@Injectable()
export class RegistrationService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly otpService: OTPService,
        private readonly jwtService: JWTService,
        private readonly bcryptService: BcryptService,
        @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
        ) { }

    async register(registerDto: RegisterDto) {
        const existingUser = await this.prisma.user.findFirst({
            where: { OR: [{ email: registerDto.email }, { number: registerDto.number }] },
        });

        if (existingUser) {
            throw new UnauthorizedException('Email or Number already in use');
        }

        const hashedPassword = await this.bcryptService.hashPassword(registerDto.password);
        const cachedData = { ...registerDto, password: hashedPassword };
        await this.redisClient.set(`pending_registration:${registerDto.number}`, JSON.stringify(cachedData), 'EX', 300);

        const otp = await this.otpService.generateOtp(registerDto.number);
        await this.otpService.sendOtpToUser(registerDto.number, otp);
    }

    async verify(number: string, otp: string) {
        const isValidOtp = await this.otpService.verifyOtp(number, otp);
        if (!isValidOtp) {
            throw new UnauthorizedException('Invalid OTP');
        }

        const cachedDataString = await this.redisClient.get(`pending_registration:${number}`);
        if (!cachedDataString) {
            throw new UnauthorizedException('No registration data found');
        }
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

        return await this.jwtService.createAccessToken({
            email: user.email,
            userId: user.id,
            role: 'user',
        });
    }
}
