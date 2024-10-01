import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { jwtConstants } from './constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateSuperUser(email: string, pass: string) {
    const user = await this.prisma.superUser.findFirst({ where: { email } });
    if (user && user.password === pass) {
      const token = await this.createAccessToken({
        email: user.email,
        userId: user.id,
        role: 'admin',
      });
      const refresh = await this.createRefreshToken({
        email: user.email,
        userId: user.id,
        role: 'admin',
      });
      return { token, refresh };
    }
    throw "Error, couldn't find the user";
  }

  async validateUserByEmail(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findFirst({ where: { email } });
    if (user && user.password === pass) {
      return await this.createAccessToken({
        email: user.email,
        userId: user.id,
        role: 'user',
      });
    }
    throw "Error, couldn't find the user";
  }

  async createRefreshToken(payload: {
    email: string;
    userId: string;
    role: 'user' | 'admin';
  }) {
    return await this.jwtService.signAsync(payload, {
      secret: jwtConstants.secret,
      expiresIn: '7d',
    });
  }

  async createAccessToken(payload: {
    email: string;
    userId: string;
    role: 'user' | 'admin';
  }) {
    return this.jwtService.signAsync(payload, {
      secret: jwtConstants.secret,
      expiresIn: '1d',
    });
  }

  decodeRefreshToken(token: string) {
    return this.jwtService.decode(token);
  }
}
