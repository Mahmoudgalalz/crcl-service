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
import { IS_PUBLIC_KEY, ROLES_KEY } from '../../decorators/roles.decorator';
import { UserService } from '../../../mobile/user/user.service';

@Injectable()
export class UserAuthGuard implements CanActivate {
  private readonly logger = new Logger(UserAuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private userService: UserService,
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

    const role = this.reflector.getAllAndOverride<boolean>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    try {
      let payload;
      if (refreshToken) {
        payload = await this.useRefreshToken(request);
      } else {
        payload = await this.jwtService.verifyAsync(token, {
          secret: jwtConstants.user,
        });
      }

      if (payload.role !== role) return false;

      const user = await this.userService.findOne(payload.userId);
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
      secret: jwtConstants.secret,
    });
    return payload;
  }
}
