import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Headers,
  UseGuards,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiProduces, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { NotificationsService } from './notifications.service';
import { UserRegisteredEventDto } from './dto/user-registered-event.dto';
import { BookingConfirmedEventDto } from './dto/booking-confirmed-event.dto';
import { PaymentFailedEventDto } from './dto/payment-failed-event.dto';
import { CheckinReminderEventDto } from './dto/checkin-reminder-event.dto';
import { RefundEventDto } from './dto/refund-event.dto';
import { DispatchTestEventDto } from './dto/test-event.dto';
import { NotificationLogEntryDto } from './dto/notification-history.dto';
import { NotificationType } from '../common/enums/notification-type.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Microservicio de Notificaciones & Vouchers PDF (Worker RabbitMQ)')
@Controller('api/notifications')
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  // =========================================================================
  // CONSUMIDORES ASÍNCRONOS DE EVENTOS RABBITMQ (AMQP WORKER)
  // =========================================================================

  @EventPattern('user.registered')
  async handleUserRegisteredRmq(@Payload() data: UserRegisteredEventDto) {
    this.logger.log(`📥 [RabbitMQ] Evento recibido: 'user.registered'`);
    return await this.notificationsService.handleUserRegistered(data);
  }

  @EventPattern('booking.created')
  async handleBookingCreatedRmq(@Payload() data: any) {
    const code = data?.bookingCode || data?.bookingReference || 'N/A';
    this.logger.log(`📥 [RabbitMQ] Evento recibido: 'booking.created' [${code}] (Pendiente de pago)`);
    return { status: 'RECEIVED', event: 'booking.created', bookingCode: code };
  }

  @EventPattern('booking.confirmed')
  async handleBookingConfirmedRmq(@Payload() data: BookingConfirmedEventDto) {
    this.logger.log(`📥 [RabbitMQ] Evento recibido: 'booking.confirmed' [${data.bookingReference}]`);
    return await this.notificationsService.handleBookingConfirmed(data);
  }

  @EventPattern('payment.succeeded')
  async handlePaymentSucceededRmq(@Payload() data: BookingConfirmedEventDto) {
    this.logger.log(`📥 [RabbitMQ] Evento recibido: 'payment.succeeded' [${data.bookingReference}]`);
    return await this.notificationsService.handleBookingConfirmed(data);
  }

  @EventPattern('payment.failed')
  async handlePaymentFailedRmq(@Payload() data: PaymentFailedEventDto) {
    this.logger.log(`📥 [RabbitMQ] Evento recibido: 'payment.failed' [${data.bookingId}]`);
    return await this.notificationsService.handlePaymentFailed(data);
  }

  @EventPattern('booking.checkin.reminder')
  async handleCheckinReminderRmq(@Payload() data: CheckinReminderEventDto) {
    this.logger.log(`📥 [RabbitMQ] Evento recibido: 'booking.checkin.reminder' [${data.bookingReference}]`);
    return await this.notificationsService.handleCheckinReminder(data);
  }

  @EventPattern('booking.cancelled')
  async handleBookingCancelledRmq(@Payload() data: RefundEventDto) {
    this.logger.log(`📥 [RabbitMQ] Evento recibido: 'booking.cancelled' [${data.bookingReference}]`);
    return await this.notificationsService.handleRefund(data);
  }

  @EventPattern('payment.refunded')
  async handlePaymentRefundedRmq(@Payload() data: RefundEventDto) {
    this.logger.log(`📥 [RabbitMQ] Evento recibido: 'payment.refunded' [${data.bookingReference}]`);
    return await this.notificationsService.handleRefund(data);
  }

  // =========================================================================
  // ENDPOINTS REST HTTP (Inspección, Pruebas y Descarga Directa de PDF)
  // =========================================================================

  @Get('status')
  @ApiOperation({
    summary: 'Estado del Worker y Broker RabbitMQ',
    description: 'Devuelve información sobre la operatividad del worker y el estado de la cola de mensajería.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Estado retornado con éxito' })
  getStatus() {
    return {
      status: 'ONLINE',
      mode: 'Worker / Consumidor Asíncrono RabbitMQ (Stateless)',
      service: 'notification-service',
      engine: 'NestJS + PDFKit + Nodemailer + QRCode',
      broker: 'RabbitMQ AMQP',
      smtp: this.notificationsService.getSmtpStatus(),
      supportedEvents: [
        'user.registered',
        'booking.confirmed',
        'payment.succeeded',
        'payment.failed',
        'booking.checkin.reminder',
        'booking.cancelled',
        'payment.refunded',
      ],
      timestamp: new Date().toISOString(),
    };
  }

  @Get('history')
  @UseGuards(RolesGuard)
  @Roles(Role.HOTEL_ADMIN, Role.GUEST)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Historial de Notificaciones Procesadas',
    description: 'El personal autorizado consulta el historial completo; GUEST solo ve sus propias notificaciones.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [NotificationLogEntryDto],
    description: 'Historial obtenido satisfactoriamente',
  })
  getHistory(
    @Headers('x-user-role') userRole: string,
    @Headers('x-user-email') userEmail?: string,
  ): NotificationLogEntryDto[] {
    if (userRole?.toUpperCase() === Role.GUEST) {
      if (!userEmail) {
        throw new UnauthorizedException('No se pudo identificar el correo del usuario autenticado');
      }
      return this.notificationsService.getHistory(userEmail);
    }

    return this.notificationsService.getHistory();
  }

  @Get('voucher/sample')
  @UseGuards(RolesGuard)
  @Roles(Role.HOTEL_ADMIN, Role.GUEST)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Descargar o Previsualizar Voucher PDF de Muestra (Usuarios Autenticados)',
    description: 'Genera en tiempo real un Voucher de Confirmación elegante en PDF con código QR y lo transmite.',
  })
  @ApiProduces('application/pdf')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Archivo PDF del Voucher retornado como flujo binario',
  })
  async getSampleVoucher(@Res() res: Response) {
    const pdfBuffer = await this.notificationsService.generateSampleVoucher();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="voucher-confirmacion-demo.pdf"',
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @Post('voucher/preview')
  @UseGuards(RolesGuard)
  @Roles(Role.HOTEL_ADMIN, Role.GUEST)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Generar Voucher PDF Personalizado (Usuarios Autenticados)',
    description: 'Recibe datos de una reserva y devuelve directamente el PDF generado con QR para verificación.',
  })
  @ApiProduces('application/pdf')
  async previewVoucher(@Body() body: any, @Res() res: Response) {
    const pdfBuffer = await this.notificationsService.generateSampleVoucher(body);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="voucher-${body.bookingReference || 'preview'}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @Post('send-welcome')
  @UseGuards(RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Probar Correo de Bienvenida (Solo HOTEL_ADMIN)',
    description: 'Despacha un correo de bienvenida tras registro simulado. Uso administrativo.',
  })
  async sendWelcome(@Body() dto: UserRegisteredEventDto) {
    return await this.notificationsService.handleUserRegistered(dto);
  }

  @Post('send-booking-confirmation')
  @UseGuards(RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Probar Confirmación de Reserva con Voucher PDF (Solo HOTEL_ADMIN)',
    description: 'Genera el PDF con QR y despacha el correo transaccional de confirmación. Uso administrativo.',
  })
  async sendBookingConfirmation(@Body() dto: BookingConfirmedEventDto) {
    const result = await this.notificationsService.handleBookingConfirmed(dto);
    return {
      message: 'Confirmación procesada y voucher PDF emitido exitosamente',
      notification: result.log,
      voucherGeneratedBytes: result.pdfBuffer.length,
    };
  }

  @Post('send-payment-failed')
  @UseGuards(RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Probar Notificación de Pago Fallido (Solo HOTEL_ADMIN)',
    description: 'Despacha la alerta de fallo y recordatorio de expiración de reserva. Uso administrativo.',
  })
  async sendPaymentFailed(@Body() dto: PaymentFailedEventDto) {
    return await this.notificationsService.handlePaymentFailed(dto);
  }

  @Post('send-checkin-reminder')
  @UseGuards(RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Probar Recordatorio de Check-in 24h (Solo HOTEL_ADMIN)',
    description: 'Despacha el correo de recordatorio pre-llegada. Uso administrativo.',
  })
  async sendCheckinReminder(@Body() dto: CheckinReminderEventDto) {
    return await this.notificationsService.handleCheckinReminder(dto);
  }

  @Post('send-refund-receipt')
  @UseGuards(RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Probar Comprobante de Reembolso (Solo HOTEL_ADMIN)',
    description: 'Despacha el comprobante oficial de reintegro financiero tras cancelación. Uso administrativo.',
  })
  async sendRefundReceipt(@Body() dto: RefundEventDto) {
    return await this.notificationsService.handleRefund(dto);
  }

  @Post('test-event')
  @UseGuards(RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Disparador Universal de Eventos de Prueba (Solo HOTEL_ADMIN)',
    description: 'Permite simular cualquier evento del broker RabbitMQ. Uso exclusivo de administración.',
  })
  async dispatchTestEvent(@Body() dto: DispatchTestEventDto) {
    switch (dto.type) {
      case NotificationType.WELCOME:
        return await this.notificationsService.handleUserRegistered(dto.payload);
      case NotificationType.BOOKING_CONFIRMATION:
        const confRes = await this.notificationsService.handleBookingConfirmed(dto.payload);
        return {
          message: 'Evento booking.confirmed procesado',
          notification: confRes.log,
          voucherBytes: confRes.pdfBuffer.length,
        };
      case NotificationType.PAYMENT_FAILED:
        return await this.notificationsService.handlePaymentFailed(dto.payload);
      case NotificationType.CHECKIN_REMINDER:
        return await this.notificationsService.handleCheckinReminder(dto.payload);
      case NotificationType.REFUND_RECEIPT:
        return await this.notificationsService.handleRefund(dto.payload);
      default:
        return {
          error: `Tipo de notificación no soportado: ${dto.type}`,
        };
    }
  }
}
