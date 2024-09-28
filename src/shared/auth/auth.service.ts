import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { AdminService } from 'src/dashboard/admin/admin.service';
import { PrismaService } from 'src/prisma.service';
import { jwtConstants } from './constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly adminService: AdminService,
  ) {}

  async signUpSuperUser(data: Omit<Prisma.SuperUserCreateInput, 'id'>) {
    return await this.adminService.create(data);
  }

  // async signUpUser(data: Omit<Prisma.UserCreateInput, 'id'>) {
  //   const id = customUUID(20);
  // }

  async validateSuperUser(email: string, pass: string) {
    const user = await this.prisma.superUser.findFirst({ where: { email } });
    if (user && user.password === pass) {
      return await this.createAccessToken({
        email: user.email,
        userId: user.id,
        role: 'admin',
      });
    }
    return null;
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
    return null;
  }

  async createRefreshToken(payload: {
    email: string;
    userId: string;
    role: 'user' | 'admin';
  }) {
    return await this.jwtService.signAsync(payload, {
      secret: jwtConstants[payload.role],
      expiresIn: '7d',
    });
  }

  async createAccessToken(payload: {
    email: string;
    userId: string;
    role: 'user' | 'admin';
  }) {
    return this.jwtService.signAsync(payload, {
      secret: jwtConstants[payload.role],
      expiresIn: '1d',
    });
  }

  decodeRefreshToken(token: string) {
    return this.jwtService.decode(token);
  }
}
