import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException(
        'Acceso denegado: Se requiere autenticación para este recurso',
      );
    }

    const userRole = (user.role || '').toUpperCase();
    const hasRole = requiredRoles.some((role) => {
      const normalizedRole = role.toUpperCase();
      if (normalizedRole === 'ADMIN' && (userRole === 'ADMIN' || userRole === 'HOTEL_ADMIN')) {
        return true;
      }
      return userRole === normalizedRole;
    });

    if (!hasRole) {
      throw new ForbiddenException(
        `Acceso denegado: Rol requerido [${requiredRoles.join(', ')}]. Tu rol es [${user.role}]`,
      );
    }

    return true;
  }
}

