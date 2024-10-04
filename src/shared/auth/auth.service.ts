import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { OTPService } from './shared/otp.service';
import { JWTService } from './shared/jwt.service';
import { BcryptService } from './shared/bcrypt.service';



@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JWTService,
    private readonly prisma: PrismaService,
    private readonly otpService: OTPService,
    private readonly bycrptService: BcryptService
  ) { }


  async validateSuperUser(email: string, pass: string) {
    const user = await this.prisma.superUser.findFirst({ where: { email } });
    if (user && (await this.bycrptService.comparePassword(pass, user.password))) {
      return await this.jwtService.createAccessToken({
        email: user.email,
        userId: user.id,
        role: 'admin',
      });
    }
    throw "Error, couldn't find the user";
  }

  async validateUserByEmail(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });
    const validPassword = await this.bycrptService.comparePassword(pass, user.password);
    if (user && validPassword) {
      return await this.jwtService.createAccessToken({
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

    if (user && await this.otpService.verifyOtp(number, otp)) {
      return await this.jwtService.createAccessToken({
        email: user.email,
        userId: user.id,
        role: 'user',
      });
    }
    throw new Error("Error, couldn't verify the user with OTP");
  }


}
