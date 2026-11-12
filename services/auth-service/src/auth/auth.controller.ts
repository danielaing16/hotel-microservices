import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { AuthResponseDto, UserProfileDto } from './dto/auth-response.dto';
import { CreateStaffDto } from '../users/dto/create-staff.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Role } from './enums/role.enum';

@ApiTags('Autenticación & Usuarios')
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar un nuevo cliente (Huésped)',
    description:
      'Registro público: crea SIEMPRE un usuario GUEST. Las cuentas de personal se crean desde el panel de administración.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuario registrado exitosamente',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'El correo electrónico ya se encuentra registrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return await this.authService.register(registerDto);
  }

  @Post('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear cuenta de Administrador — Solo HOTEL_ADMIN',
    description:
      'Flujo oficial para crear cuentas operativas. El registro público (/register) solo crea clientes GUEST.',
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Cuenta de personal creada exitosamente' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'El correo ya se encuentra registrado' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Acceso denegado: requiere rol HOTEL_ADMIN' })
  async createStaff(@Body() staffDto: CreateStaffDto) {
    return await this.authService.createStaff(staffDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Valida credenciales de acceso y retorna el token de autenticación JWT.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inicio de sesión exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciales inválidas',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return await this.authService.login(loginDto);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión o registro con Google OAuth',
    description: 'Valida o crea el usuario a partir de sus credenciales de Google y retorna el token JWT.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inicio de sesión con Google exitoso',
    type: AuthResponseDto,
  })
  async googleLogin(@Body() googleDto: GoogleLoginDto): Promise<AuthResponseDto> {
    return await this.authService.googleLogin(googleDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener perfil del usuario autenticado',
    description: 'Ruta protegida por JWT. Devuelve los datos del usuario extraídos del token validado.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Perfil del usuario obtenido con éxito',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token ausente, inválido o expirado',
  })
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Get('validate-token')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Validar token JWT (Uso para API Gateway y otros microservicios)',
    description: 'Endpoint ligero para verificar validez y roles del token sin acceder a la base de datos de usuarios.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token válido',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido o expirado',
  })
  async validateToken(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Encabezado Authorization con formato Bearer requerido');
    }
    const token = authHeader.split(' ')[1];
    return await this.authService.validateToken(token);
  }

  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Demostración de Control de Acceso basado en Roles (RBAC)',
    description: 'Solo accesible para usuarios que tengan el rol HOTEL_ADMIN.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Acceso autorizado como Administrador',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No posee el rol HOTEL_ADMIN requerido',
  })
  adminOnlyEndpoint(@CurrentUser() user: any) {
    return {
      message: 'Bienvenido al panel exclusivo de administración hotelera',
      adminUser: user,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar todos los usuarios registrados (Solo Administrador)',
    description: 'Devuelve la lista de usuarios con datos básicos. Solo accesible para HOTEL_ADMIN.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de usuarios obtenida correctamente' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Acceso denegado: rol insuficiente' })
  async getAllUsers(@CurrentUser() currentUser: any) {
    if (!currentUser) throw new ForbiddenException('Acceso restringido');
    return await this.usersService.findAll();
  }

  @Delete('users/guests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Eliminar todos los usuarios con rol GUEST para pruebas y liberar correos (Solo HOTEL_ADMIN)',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Usuarios GUEST eliminados exitosamente' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Acceso denegado: requiere rol HOTEL_ADMIN' })
  async deleteGuests() {
    return await this.usersService.deleteGuests();
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Eliminar un usuario por ID (Solo HOTEL_ADMIN)',
  })
  async deleteUser(@Param('id') id: string) {
    return await this.usersService.deleteById(id);
  }

  @Patch('users/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Activar / desactivar una cuenta (Solo HOTEL_ADMIN)',
    description: 'Desactiva el acceso (bloqueo de login) sin eliminar el historial del usuario.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Estado de la cuenta actualizado' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Acceso denegado: requiere rol HOTEL_ADMIN' })
  async setUserStatus(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    const isActive = body?.isActive === true;
    if (typeof body?.isActive !== 'boolean') {
      throw new BadRequestException('El campo isActive debe ser un booleano');
    }
    return await this.usersService.setStatus(id, isActive);
  }
}
