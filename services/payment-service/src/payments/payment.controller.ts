import {
  Controller,
  Get,
  Post,
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
import { PaymentService } from './payment.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { QueryPaymentsDto } from './dto/query-payments.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import {
  CurrentUser,
  RequestUser,
} from '../common/decorators/current-user.decorator';

@ApiTags('Pagos (Payment Service)')
@Controller('api/payments')
@UseGuards(RolesGuard)
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post('process')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Procesar pago de reserva con idempotencia (Huésped / Checkout)',
    description:
      'Valida la reserva contra Booking Service, verifica anti-doble cobro mediante idempotencyKey, procesa la transacción y emite payment.succeeded en RabbitMQ.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pago procesado exitosamente',
  })
  async process(
    @Body() processDto: ProcessPaymentDto,
    @CurrentUser() user: RequestUser,
  ) {
    return await this.paymentService.processPayment(processDto, user);
  }

  @Get('my-payments')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Historial de pagos y recibos del usuario en sesión',
  })
  async findMyPayments(@CurrentUser() user: RequestUser) {
    return await this.paymentService.findMyPayments(user.id);
  }

  @Get()
  @Roles(Role.HOTEL_ADMIN, Role.ADMIN, Role.HOTEL_MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listado administrativo de pagos y conciliación financiera (Staff)',
  })
  async findAll(@Query() query: QueryPaymentsDto) {
    return await this.paymentService.findAll(query);
  }

  @Get(':idOrRef')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Comprobante y detalle de transacción por ID o referencia',
  })
  async findOne(
    @Param('idOrRef') idOrRef: string,
    @CurrentUser() user: RequestUser,
  ) {
    return await this.paymentService.findOne(idOrRef, user);
  }

  @Post(':idOrRef/refund')
  @Roles(Role.HOTEL_ADMIN, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Procesar reembolso financiero total (Solo Administradores)',
    description:
      'Reversa el cobro a estado REFUNDED y emite el evento payment.refunded a través de RabbitMQ.',
  })
  async refund(
    @Param('idOrRef') idOrRef: string,
    @Body() refundDto: RefundPaymentDto,
    @CurrentUser() user: RequestUser,
  ) {
    return await this.paymentService.refundPayment(idOrRef, refundDto.reason, user);
  }

  @Post('seed')
  @Roles(Role.HOTEL_ADMIN, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Sembrar datos de demostración de pagos (Solo Administrador)',
  })
  async seed() {
    await this.paymentService.seed();
    return { message: 'Semilla de pagos inicializada correctamente' };
  }
}

