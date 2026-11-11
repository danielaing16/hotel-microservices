import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthHeaderMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    // 1. Prioridad: Encabezados inyectados por el API Gateway verificado
    const gatewayUserId = req.headers['x-user-id'] as string;
    const gatewayUserEmail = req.headers['x-user-email'] as string;
    const gatewayUserRole = req.headers['x-user-role'] as string;

    if (gatewayUserId && gatewayUserId !== 'anonymous') {
      req['user'] = {
        id: gatewayUserId,
        email: gatewayUserEmail || '',
        role: gatewayUserRole || 'GUEST',
      };
      return next();
    }

    // 2. Respaldo: Decodificación local de Authorization Bearer JWT
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const secret = this.configService.get<string>(
          'JWT_SECRET',
          'super_secret_jwt_key_hotel_2026_dev',
        );
        const decoded: any = this.jwtService.verify(token, { secret });
        req['user'] = {
          id: decoded.sub || decoded.id,
          email: decoded.email,
          role: decoded.role || 'GUEST',
        };
      } catch (err) {
        // Token inválido o expirado
      }
    }

    next();
  }
}

