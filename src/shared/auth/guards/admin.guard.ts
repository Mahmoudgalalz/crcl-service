import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from '../constants';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../decorators/roles.decorator';
import { AdminService } from '../../../dashboard/admin/admin.service';

@Injectable()
export class SuperUserAuthGuard implements CanActivate {
  private readonly logger = new Logger(SuperUserAuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private adminService: AdminService,
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

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      let payload;
      if (refreshToken) {
        payload = await this.useRefreshToken(request);
      } else {
        payload = await this.jwtService.verifyAsync(token, {
          secret: jwtConstants.admin,
        });
      }

      const user = await this.adminService.findOne(payload.userId);
      request['user'] = user;
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
      secret: jwtConstants.admin,
    });
    return payload;
  }
}
