import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JWTService {
  constructor(private readonly jwtService: JwtService) {}

  async createRefreshToken(payload: {
    email: string;
    userId: string;
    role: 'user' | 'admin';
  }) {
    return await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });
  }

  async createAccessToken(payload: {
    email: string;
    userId: string;
    role: 'user' | 'admin';
  }) {
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1d',
    });
  }
  async createTokens(payload: {
    email: string;
    userId: string;
    role: 'user' | 'admin';
  }) {
    const access_token = await this.createAccessToken({
      email: payload.email,
      userId: payload.userId,
      role: payload.role,
    });

    const refresh_token = await this.createRefreshToken({
      email: payload.email,
      userId: payload.userId,
      role: payload.role,
    });

    return { access_token, refresh_token };
  }

  decodeRefreshToken(token: string) {
    return this.jwtService.decode(token);
  }
}
