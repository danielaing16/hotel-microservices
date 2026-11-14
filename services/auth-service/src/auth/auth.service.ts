import { Injectable, UnauthorizedException, BadRequestException, Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { CreateStaffDto } from '../users/dto/create-staff.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Role } from './enums/role.enum';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('NOTIFICATIONS_SERVICE')
    private readonly notificationClient: ClientProxy,
  ) {}

  private emitUserRegistered(user: { id: string; email: string; firstName: string; lastName: string; role?: string }) {
    const payload = {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      loginUrl: 'http://localhost:5173',
      role: user.role || 'GUEST',
    };
    try {
      this.notificationClient.emit('user.registered', payload);
      this.logger.log(`🐇 Evento 'user.registered' emitido a RabbitMQ para ${user.email}`);
    } catch (err) {
      this.logger.warn(`No se pudo emitir evento 'user.registered' a RabbitMQ: ${err.message}`);
    }

    // Despacho directo garantizado hacia notification-service
    fetch('http://notification-service:3008/api/notifications/internal/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'user.registered', payload }),
    }).catch(() => {});
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // RBAC: el registro público SOLO puede crear clientes (GUEST).
    // La creación de cuentas de administrador (HOTEL_ADMIN) se hace
    // desde el panel del administrador (POST /api/auth/users).
    const createdUser = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      role: Role.GUEST,
    });

    this.emitUserRegistered(createdUser);

    return this.buildAuthResponse(createdUser);
  }

  /**
   * RBAC: creación de cuentas de personal (Recepcionista / Administrador).
   * Exclusiva del panel de administración; no envía correo de bienvenida
   * de cliente ni eventos de registro.
   */
  async createStaff(staffDto: CreateStaffDto): Promise<AuthResponseDto> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(staffDto.password, saltRounds);

    const createdUser = await this.usersService.create({
      ...staffDto,
      password: hashedPassword,
    });

    this.logger.log(
      `👤 Cuenta de personal ${createdUser.email} (${createdUser.role}) creada por el administrador`,
    );

    return this.buildAuthResponse(createdUser);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas (correo o contraseña incorrectos)');
    }

    const isPasswordMatching = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Credenciales inválidas (correo o contraseña incorrectos)');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('La cuenta de usuario se encuentra deshabilitada');
    }

    return this.buildAuthResponse(user);
  }

  async googleLogin(googleDto: GoogleLoginDto): Promise<AuthResponseDto> {
    if (!googleDto.email) {
      throw new BadRequestException('El correo electrónico de Google es obligatorio');
    }

    let user = await this.usersService.findByEmail(googleDto.email);

    if (!user) {
      // Si el usuario accede por primera vez con Google, se registra automáticamente como Huésped (GUEST)
      const randomPassword = await bcrypt.hash(`google-oauth-${Date.now()}-${Math.random()}`, 10);
      user = await this.usersService.create({
        email: googleDto.email,
        firstName: googleDto.firstName || 'Usuario',
        lastName: googleDto.lastName || 'Google',
        password: randomPassword,
        role: Role.GUEST,
      });

      this.emitUserRegistered(user);
    }

    if (!user.isActive) {
      throw new UnauthorizedException('La cuenta de usuario se encuentra deshabilitada');
    }

    return this.buildAuthResponse(user);
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Token inválido o usuario inactivo');
      }
      return {
        isValid: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    } catch {
      throw new UnauthorizedException('El token proporcionado no es válido o ha expirado');
    }
  }

  private buildAuthResponse(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: Role;
    isActive: boolean;
  }): AuthResponseDto {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '24h';

    return {
      access_token: token,
      accessToken: token,
      token_type: 'Bearer',
      expires_in: expiresIn,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }
}
