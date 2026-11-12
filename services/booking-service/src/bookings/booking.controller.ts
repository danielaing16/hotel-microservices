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
  // CONSUMIDORES DE EVENTOS ASÃNCRONOS (RABBITMQ EDA)
  // =========================================================================

  @EventPattern('payment.succeeded')
  async handlePaymentSucceededRmq(@Payload() data: any) {
    this.logger.log(`ðŸ“¥ [RabbitMQ] Evento 'payment.succeeded' recibido en Booking Service`);
    return await this.bookingService.handlePaymentSucceeded(data);
  }

  @EventPattern('payment.failed')
  async handlePaymentFailedRmq(@Payload() data: any) {
    this.logger.log(`ðŸ“¥ [RabbitMQ] Evento 'payment.failed' recibido en Booking Service`);
    return await this.bookingService.handlePaymentFailed(data);
  }

  // =========================================================================
  // ENDPOINTS REST HTTP
  // =========================================================================

  @Post()
  @Roles(Role.GUEST)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Crear una nueva reserva de hotel (HuÃ©sped / Cliente)',
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
    summary: 'Historial de reservas del usuario en sesiÃ³n',
    description:
      'Retorna todas las reservas realizadas por el usuario actualmente autenticado ordenadas cronolÃ³gicamente.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listado de reservas personales',
  })
  async findMyBookings(@CurrentUser() user: RequestUser) {
    return await this.bookingService.findMyBookings(user.id);
  }

  @Get()
  @Roles(Role.HOTEL_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listado administrativo de reservas (RecepciÃ³n y AdministraciÃ³n)',
    description:
      'Consulta paginada con filtros por hotel, estado (CONFIRMED, CHECKED_IN) o bÃºsqueda por cÃ³digo.',
  })
  async findAll(@Query() query: QueryBookingsDto) {
    return await this.bookingService.findAll(query);
  }

  @Get(':idOrCode')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Detalle de reserva por ID o cÃ³digo de confirmaciÃ³n',
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
    summary: 'Cancelar una reserva (CompensaciÃ³n Saga)',
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
  @Roles(Role.HOTEL_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Registrar Check-In fÃ­sico del huÃ©sped en recepciÃ³n',
    description:
      'Permite al recepcionista verificar al huÃ©sped y marcar la reserva como CHECKED_IN.',
  })
  async checkIn(
    @Param('idOrCode') idOrCode: string,
    @CurrentUser() user: RequestUser,
  ) {
    return await this.bookingService.checkInBooking(idOrCode, user);
  }

  @Patch(':idOrCode/checkout')
  @Roles(Role.HOTEL_ADMIN)
  @ApiOperation({
    summary: 'Registrar Check-Out y finalizar estancia',
    description:
      'Marca la estancia como COMPLETED para liberar habitaciÃ³n a limpieza y habilitar reseÃ±as.',
  })
  async checkOut(
    @Param('idOrCode') idOrCode: string,
    @CurrentUser() user: RequestUser,
  ) {
    return await this.bookingService.completeBooking(idOrCode, user);
  }

  @Post('seed')
  @Roles(Role.HOTEL_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Sembrar datos de demostraciÃ³n de reservas (Solo Administrador)',
  })
  async seed() {
    await this.bookingService.seed();
    return { message: 'Semilla de reservas ejecutada con Ã©xito' };
  }
}

