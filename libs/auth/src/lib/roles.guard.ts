import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@task-manager/data';
import { ROLES_KEY } from './roles.decorator';

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
    const { user } = context.switchToHttp().getRequest();
    
    // Implement role inheritance logic: Owner > Admin > Viewer
    return requiredRoles.some((role) => this.hasPermission(user.role, role));
  }

  private hasPermission(userRole: Role, requiredRole: Role): boolean {
    if (userRole === Role.OWNER) return true;
    if (userRole === Role.ADMIN && requiredRole !== Role.OWNER) return true;
    if (userRole === Role.VIEWER && requiredRole === Role.VIEWER) return true;
    return false;
  }
}

