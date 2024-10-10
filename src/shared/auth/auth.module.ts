import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.service';
import { jwtConstants } from './shared/constants';
import { OTPService } from './shared/otp.service';
import { JWTService } from './shared/jwt.service';
import { BcryptService } from './shared/bcrypt.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      secretOrPrivateKey: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    AuthService,
    OTPService,
    JWTService,
    BcryptService,
  ],
})
export class AuthModule {}
