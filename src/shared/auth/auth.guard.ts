import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/roles.decorator';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    const refreshToken = request.cookies['refreshToken'];

    if (!token && !refreshToken) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      let payload;
      if (refreshToken) {
        payload = await this.useRefreshToken(request);
      } else {
        payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET,
        });
      }

      if (payload.role === 'admin') {
        const user = await this.prisma.superUser.findFirst({
          where: {
            id: payload.userId,
          },
        });
        request['user'] = user;
      } else {
        const user = await this.prisma.user.findFirst({
          where: {
            id: payload.userId,
          },
        });
        if (user.deletedAt != null || user.status === 'BLOCKED') {
          throw new UnauthorizedException(
            'Account is suspended or desactivated, contact the support',
          );
          return false;
        }
        request['user'] = user;
      }
      return true;
    } catch (error) {
      this.logger.error(`Failed to authenticate: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return undefined;
    }
    return authHeader.split(' ')[1];
  }

  private async useRefreshToken(request: Request) {
    const oldRefreshToken = request.cookies['refreshToken'];
    const payload = await this.jwtService.verifyAsync(oldRefreshToken, {
      secret: process.env.JWT_SECRET,
    });
    return payload;
  }
}
