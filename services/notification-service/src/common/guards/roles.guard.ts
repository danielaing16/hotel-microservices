import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard RBAC para el worker de notificaciones.
 *
 * A diferencia de los demás microservicios, este servicio no valida JWT:
 * confía en la identidad que el API Gateway inyecta en las cabeceras
 * x-user-id / x-user-role (el gateway limpia cualquier intento de spoofing
 * del cliente antes de reenviar).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRole = (
      request.user?.role ||
      request.headers['x-user-role'] ||
      request.headers['x-userrole'] ||
      ''
    )
      .toString()
      .toUpperCase();

    if (!userRole) {
      throw new UnauthorizedException(
        'Acceso denegado: se requiere autenticación (cabecera de identidad ausente)',
      );
    }

    if (!requiredRoles.some((role) => userRole === role.toUpperCase())) {
      throw new ForbiddenException(
        `Acceso denegado: Rol requerido [${requiredRoles.join(', ')}]. Tu rol es [${userRole}]`,
      );
    }

    return true;
  }
}
