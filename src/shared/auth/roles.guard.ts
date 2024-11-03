import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../interface/roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user }: { user: any } = context.switchToHttp().getRequest();
    const userRole = user.type;

    // Define admin-like roles
    const adminRoles: Role[] = [
      Role.Admin,
      Role.Finance,
      Role.Moderator,
      Role.Approval,
    ];

    // Check if the user has an admin-like role or any required role
    return (
      adminRoles.includes(userRole) ||
      requiredRoles.some((role) => role === userRole)
    );
  }
}
