import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EventPattern, Payload } from '@nestjs/microservices';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import {
  CurrentUser,
  RequestUser,
} from '../common/decorators/current-user.decorator';

@ApiTags('Reservas (Booking Service)')
@Controller('api/bookings')
@UseGuards(RolesGuard)
export class BookingController {
  private readonly logger = new Logger(BookingController.name);

  constructor(private readonly bookingService: BookingService) {}

  // =========================================================================
  // CONSUMIDORES DE EVENTOS ASÍNCRONOS (RABBITMQ EDA)
  // =========================================================================

  @EventPattern('payment.succeeded')
  async handlePaymentSucceededRmq(@Payload() data: any) {
    this.logger.log(`📥 [RabbitMQ] Evento 'payment.succeeded' recibido en Booking Service`);
    return await this.bookingService.handlePaymentSucceeded(data);
  }

  @EventPattern('payment.failed')
  async handlePaymentFailedRmq(@Payload() data: any) {
    this.logger.log(`📥 [RabbitMQ] Evento 'payment.failed' recibido en Booking Service`);
    return await this.bookingService.handlePaymentFailed(data);
  }

  // =========================================================================
  // ENDPOINTS REST HTTP
  // =========================================================================

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Crear una nueva reserva de hotel (Huésped / Cliente)',
    description:
      'Inicia el ciclo de vida de la reserva, bloquea inventario con Availability Service y emite el evento booking.created para checkout.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Reserva creada en estado PENDING_PAYMENT',
  })
  async create(
    @Body() createDto: CreateBookingDto,
    @CurrentUser() user: RequestUser,
  ) {
    return await this.bookingService.createBooking(createDto, user);
  }

  @Get('my-bookings')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Historial de reservas del usuario en sesión',
    description:
      'Retorna todas las reservas realizadas por el usuario actualmente autenticado ordenadas cronológicamente.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listado de reservas personales',
  })
  async findMyBookings(@CurrentUser() user: RequestUser) {
    return await this.bookingService.findMyBookings(user.id);
  }

  @Get()
  @Roles(Role.HOTEL_ADMIN, Role.ADMIN, Role.HOTEL_MANAGER, Role.RECEPTIONIST)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listado administrativo de reservas (Recepción y Administración)',
    description:
      'Consulta paginada con filtros por hotel, estado (CONFIRMED, CHECKED_IN) o búsqueda por código.',
  })
  async findAll(@Query() query: QueryBookingsDto) {
    return await this.bookingService.findAll(query);
  }

  @Get(':idOrCode')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Detalle de reserva por ID o código de confirmación',
    description:
      'Obtiene el registro detallado de la reserva validando pertenencia o privilegios de personal del hotel.',
  })
  async findOne(
    @Param('idOrCode') idOrCode: string,
    @CurrentUser() user: RequestUser,
  ) {
    return await this.bookingService.findOne(idOrCode, user);
  }

  @Patch(':idOrCode/cancel')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Cancelar una reserva (Compensación Saga)',
    description:
      'Cambia el estado a CANCELLED, libera las fechas bloqueadas en Availability Service y emite booking.cancelled.',
  })
  async cancel(
    @Param('idOrCode') idOrCode: string,
    @Body() cancelDto: CancelBookingDto,
    @CurrentUser() user: RequestUser,
  ) {
    return await this.bookingService.cancelBooking(idOrCode, cancelDto.reason, user);
  }

  @Patch(':idOrCode/checkin')
  @Roles(Role.RECEPTIONIST, Role.HOTEL_ADMIN, Role.ADMIN, Role.HOTEL_MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Registrar Check-In físico del huésped en recepción',
    description:
      'Permite al recepcionista verificar al huésped y marcar la reserva como CHECKED_IN.',
  })
  async checkIn(
    @Param('idOrCode') idOrCode: string,
    @CurrentUser() user: RequestUser,
  ) {
    return await this.bookingService.checkInBooking(idOrCode, user);
  }

  @Patch(':idOrCode/checkout')
  @Roles(Role.RECEPTIONIST, Role.HOTEL_ADMIN, Role.ADMIN, Role.HOTEL_MANAGER)
  @ApiOperation({
    summary: 'Registrar Check-Out y finalizar estancia',
    description:
      'Marca la estancia como COMPLETED para liberar habitación a limpieza y habilitar reseñas.',
  })
  async checkOut(
    @Param('idOrCode') idOrCode: string,
    @CurrentUser() user: RequestUser,
  ) {
    return await this.bookingService.completeBooking(idOrCode, user);
  }

  @Post('seed')
  @Roles(Role.HOTEL_ADMIN, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Sembrar datos de demostración de reservas (Solo Administrador)',
  })
  async seed() {
    await this.bookingService.seed();
    return { message: 'Semilla de reservas ejecutada con éxito' };
  }
}

