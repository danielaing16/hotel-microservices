import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  HttpStatus,
  HttpCode,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { SearchAvailabilityDto } from './dto/search-availability.dto';
import { HoldRoomDto } from './dto/hold-room.dto';
import { ReleaseHoldDto } from './dto/release-hold.dto';
import { CalendarQueryDto } from './dto/calendar-query.dto';
import { AdminBlockDatesDto } from './dto/admin-block-dates.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Disponibilidad, Calendario & Redis Locks')
@Controller('api/availability')
export class AvailabilityController {
  private readonly logger = new Logger(AvailabilityController.name);

  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly configService: ConfigService,
  ) {}

  // =========================================================================
  // CONSUMIDORES DE EVENTOS ASÍNCRONOS RABBITMQ (AMQP)
  // =========================================================================

  @EventPattern('payment.succeeded')
  async handlePaymentSucceededRmq(@Payload() data: any) {
    this.logger.log(`📥 [RabbitMQ] Evento 'payment.succeeded' recibido en Availability`);
    return await this.availabilityService.handlePaymentSucceeded(data);
  }

  @EventPattern('payment.failed')
  async handlePaymentFailedRmq(@Payload() data: any) {
    this.logger.log(`📥 [RabbitMQ] Evento 'payment.failed' recibido en Availability`);
    return await this.availabilityService.handlePaymentFailedOrCancelled(data);
  }

  @EventPattern('booking.cancelled')
  async handleBookingCancelledRmq(@Payload() data: any) {
    this.logger.log(`📥 [RabbitMQ] Evento 'booking.cancelled' recibido en Availability`);
    return await this.availabilityService.handlePaymentFailedOrCancelled(data);
  }

  @EventPattern('booking.confirmed')
  async handleBookingConfirmedRmq(@Payload() data: any) {
    this.logger.log(`📥 [RabbitMQ] Evento 'booking.confirmed' recibido en Availability`);
    return await this.availabilityService.handleBookingConfirmed(data);
  }

  @EventPattern('booking.created')
  async handleBookingCreatedRmq(@Payload() data: any) {
    return true;
  }

  @EventPattern('user.registered')
  async handleUserRegisteredRmq(@Payload() data: any) {
    return true;
  }

  @Public()
  @Post('confirm-hold')
  async confirmHoldDirect(
    @Body() body: any,
    @Headers('x-internal-token') internalToken: string,
  ) {
    // Protección de llamada interna: solo booking-service conoce el JWT_SECRET
    // compartido y lo envía como x-internal-token. Un externo no autorizado
    // no puede confirmar holds directamente contra availability.
    const expected = this.configService.get<string>('JWT_SECRET');
    if (!internalToken || internalToken !== expected) {
      throw new ForbiddenException('Llamada interna no autorizada');
    }
    return await this.availabilityService.handleBookingConfirmed(body);
  }

  // =========================================================================
  // ENDPOINTS REST HTTP
  // =========================================================================

  @Public()
  @Get('search')
  @ApiOperation({
    summary: 'Buscar habitaciones disponibles por fechas y calcular cotización (Lectura Pública)',
    description:
      'Cruza el catálogo de habitaciones contra reservas en PostgreSQL y Soft-Locks temporales en Redis [checkIn, checkOut). Aplica cotización dinámica con recargo de fin de semana.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listado de habitaciones disponibles obtenido exitosamente',
  })
  async search(@Query() query: SearchAvailabilityDto) {
    return await this.availabilityService.searchAvailability(query);
  }

  @Post('hold')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Generar bloqueo temporal de habitación (Soft-Lock / Hold 10 min)',
    description:
      'Adquiere un candado atómico en Redis (TTL 10 min) y registra el hold en PostgreSQL para garantizar anti-overbooking durante el checkout bancario.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Bloqueo temporal adquirido exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'La habitación ya está ocupada o bloqueada por otro usuario',
  })
  async createHold(
    @Body() holdDto: HoldRoomDto,
    @CurrentUser() user: RequestUser,
  ) {
    if (!user || !user.id || user.id === 'anonymous') {
      throw new UnauthorizedException('Debes iniciar sesión para adquirir un bloqueo de habitación');
    }
    return await this.availabilityService.createHold(holdDto, user.id);
  }

  @Post('release')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Liberar anticipadamente un bloqueo temporal (Hold)',
    description: 'Elimina el candado en Redis y actualiza el estado en PostgreSQL a RELEASED.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bloqueo temporal liberado satisfactoriamente',
  })
  async releaseHold(
    @Body() releaseDto: ReleaseHoldDto,
    @CurrentUser() user: RequestUser,
  ) {
    // RBAC: el personal (RECEPTIONIST / HOTEL_ADMIN) puede liberar cualquier hold
    // atascado; un cliente solo puede liberar sus propios bloqueos.
    const isStaff =
      user?.role === Role.HOTEL_ADMIN || user?.role === Role.RECEPTIONIST;
    return await this.availabilityService.releaseHold(releaseDto.holdId, user?.id, isStaff);
  }

  @Public()
  @Get('calendar/:roomId')
  @ApiOperation({
    summary: 'Consultar calendario mensual de ocupación de una habitación',
    description: 'Devuelve el estado día por día del mes (AVAILABLE, HOLD, BOOKED) combinando PostgreSQL y Redis.',
  })
  @ApiParam({ name: 'roomId', description: 'UUID de la habitación' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Calendario mensual obtenido con éxito',
  })
  async getCalendar(
    @Param('roomId') roomId: string,
    @Query() query: CalendarQueryDto,
  ) {
    return await this.availabilityService.getRoomCalendar(roomId, query);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @Post('admin/block-dates')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Bloquear fechas manualmente para una habitación (Exclusivo HOTEL_ADMIN)',
    description: 'Permite al administrador inhabilitar fechas por remodelación, mantenimiento o cierre de temporada.',
  })
  async blockDates(
    @Body() dto: AdminBlockDatesDto,
    @CurrentUser() user: RequestUser,
  ) {
    return await this.availabilityService.blockDatesAdmin(dto, user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @Post('admin/unblock-dates')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Habilitar fechas previamente bloqueadas por administración (Exclusivo HOTEL_ADMIN)',
  })
  async unblockDates(
    @Body() dto: { roomId: string; checkIn: string; checkOut: string },
  ) {
    return await this.availabilityService.unblockDatesAdmin(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @Post('seed')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Poblar disponibilidad con reservas iniciales de prueba (Solo HOTEL_ADMIN)',
  })
  async seed() {
    return await this.availabilityService.seed();
  }
}

