import { Injectable, Logger } from '@nestjs/common';
import { MailService, EmailSendResult } from '../mail/mail.service';
import { VoucherGeneratorService } from '../pdf/voucher-generator.service';
import { VoucherData } from '../pdf/interfaces/voucher-data.interface';
import { UserRegisteredEventDto } from './dto/user-registered-event.dto';
import { BookingConfirmedEventDto } from './dto/booking-confirmed-event.dto';
import { PaymentFailedEventDto } from './dto/payment-failed-event.dto';
import { CheckinReminderEventDto } from './dto/checkin-reminder-event.dto';
import { RefundEventDto } from './dto/refund-event.dto';
import { NotificationLogEntryDto } from './dto/notification-history.dto';
import { NotificationStatus, NotificationType } from '../common/enums/notification-type.enum';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly historyLogs: NotificationLogEntryDto[] = [];
  private readonly MAX_HISTORY_ITEMS = 50;

  constructor(
    private readonly mailService: MailService,
    private readonly voucherGeneratorService: VoucherGeneratorService,
  ) {}

  /**
   * 1. Manejo del evento de Registro de Usuario (user.registered)
   */
  async handleUserRegistered(event: UserRegisteredEventDto): Promise<NotificationLogEntryDto> {
    const start = Date.now();
    this.logger.log(`[Event: user.registered] Procesando bienvenida para: ${event.email}`);

    const result = await this.mailService.sendWelcomeEmail(event.email, {
      firstName: event.firstName,
      lastName: event.lastName,
      email: event.email,
      loginUrl: event.loginUrl,
    });

    return this.recordLog(
      NotificationType.WELCOME,
      event.email,
      '🎉 ¡Bienvenido a Travel & Resorts! Cuenta creada con éxito',
      result,
      Date.now() - start,
      false,
    );
  }

  /**
   * 2. Manejo del evento de Confirmación de Reserva (booking.confirmed / payment.succeeded)
   * Genera el voucher PDF con código QR y lo adjunta al correo electrónico
   */
  async handleBookingConfirmed(
    event: BookingConfirmedEventDto,
  ): Promise<{ log: NotificationLogEntryDto; pdfBuffer: Buffer }> {
    const start = Date.now();
    this.logger.log(
      `[Event: booking.confirmed] Procesando confirmación y voucher PDF para: ${event.bookingReference} (${event.userEmail})`,
    );

    // Preparar estructura de datos para el motor PDFKit
    const voucherData: VoucherData = {
      bookingId: event.bookingId,
      bookingReference: event.bookingReference,
      guestName: event.userName,
      guestEmail: event.userEmail,
      guestPhone: event.userPhone,
      hotelName: event.hotelName,
      hotelAddress: event.hotelAddress,
      hotelCity: event.hotelCity,
      roomTypeName: event.roomTypeName,
      checkInDate: event.checkInDate,
      checkOutDate: event.checkOutDate,
      checkInTime: event.checkInTime || '15:00',
      checkOutTime: event.checkOutTime || '11:00',
      nights: event.nights,
      guestsCount: event.guestsCount,
      totalAmount: event.totalAmount,
      currency: event.currency || 'USD',
      paymentId: event.paymentId,
      paymentMethod: event.paymentMethod,
      specialRequests: event.specialRequests,
      status: 'CONFIRMED',
    };

    // Generar el Voucher en PDF de forma asíncrona y eficiente
    const pdfBuffer = await this.voucherGeneratorService.generateVoucherPdf(voucherData);

    // Despachar el correo electrónico con el PDF adjunto
    const result = await this.mailService.sendBookingConfirmationEmail(
      event.userEmail,
      {
        guestName: event.userName,
        bookingReference: event.bookingReference,
        hotelName: event.hotelName,
        hotelAddress: event.hotelAddress,
        hotelCity: event.hotelCity,
        roomTypeName: event.roomTypeName,
        checkInDate: event.checkInDate,
        checkOutDate: event.checkOutDate,
        nights: event.nights,
        guestsCount: event.guestsCount,
        totalAmount: event.totalAmount,
        currency: event.currency || 'USD',
        dashboardUrl: event.dashboardUrl,
      },
      pdfBuffer,
    );

    const log = this.recordLog(
      NotificationType.BOOKING_CONFIRMATION,
      event.userEmail,
      `🏨 Confirmación de Reserva [${event.bookingReference}] - ${event.hotelName}`,
      result,
      Date.now() - start,
      true,
    );

    return { log, pdfBuffer };
  }

  /**
   * 3. Manejo del evento de Pago Fallido (payment.failed)
   */
  async handlePaymentFailed(event: PaymentFailedEventDto): Promise<NotificationLogEntryDto> {
    const start = Date.now();
    this.logger.warn(
      `[Event: payment.failed] Notificando fallo de pago para la reserva ${event.bookingId} (${event.userEmail})`,
    );

    const result = await this.mailService.sendPaymentFailedEmail(event.userEmail, {
      guestName: event.userName,
      bookingId: event.bookingId,
      hotelName: event.hotelName,
      roomTypeName: event.roomTypeName,
      totalAmount: event.totalAmount,
      currency: event.currency || 'USD',
      failureReason: event.failureReason,
      retryPaymentUrl: event.retryPaymentUrl,
      expiresAt: event.expiresAt,
    });

    return this.recordLog(
      NotificationType.PAYMENT_FAILED,
      event.userEmail,
      `⚠️ Pago no completado para tu reserva en ${event.hotelName}`,
      result,
      Date.now() - start,
      false,
    );
  }

  /**
   * 4. Manejo del recordatorio de Check-in (booking.checkin.reminder)
   */
  async handleCheckinReminder(event: CheckinReminderEventDto): Promise<NotificationLogEntryDto> {
    const start = Date.now();
    this.logger.log(
      `[Event: booking.checkin.reminder] Enviando recordatorio 24h a: ${event.userEmail} [${event.bookingReference}]`,
    );

    const result = await this.mailService.sendCheckinReminderEmail(event.userEmail, {
      guestName: event.userName,
      bookingReference: event.bookingReference,
      hotelName: event.hotelName,
      hotelAddress: event.hotelAddress,
      hotelCity: event.hotelCity,
      roomTypeName: event.roomTypeName,
      checkInDate: event.checkInDate,
      checkInTime: event.checkInTime || '15:00',
      specialInstructions: event.specialInstructions,
      portalUrl: event.portalUrl,
    });

    return this.recordLog(
      NotificationType.CHECKIN_REMINDER,
      event.userEmail,
      `⏰ ¡Tu estadía en ${event.hotelName} es mañana! Recordatorio de Check-in`,
      result,
      Date.now() - start,
      false,
    );
  }

  /**
   * 5. Manejo del comprobante de Reembolso (booking.cancelled / payment.refunded)
   */
  async handleRefund(event: RefundEventDto): Promise<NotificationLogEntryDto> {
    const start = Date.now();
    this.logger.log(
      `[Event: payment.refunded] Enviando comprobante de reembolso a: ${event.userEmail} [${event.bookingReference}]`,
    );

    const result = await this.mailService.sendRefundReceiptEmail(event.userEmail, {
      guestName: event.userName,
      bookingReference: event.bookingReference,
      refundId: event.refundId,
      hotelName: event.hotelName,
      roomTypeName: event.roomTypeName,
      refundAmount: event.refundAmount,
      originalAmount: event.originalAmount,
      currency: event.currency || 'USD',
      reason: event.reason,
      portalUrl: event.portalUrl,
    });

    return this.recordLog(
      NotificationType.REFUND_RECEIPT,
      event.userEmail,
      `🧾 Comprobante Oficial de Reembolso [${event.bookingReference}]`,
      result,
      Date.now() - start,
      false,
    );
  }

  /**
   * Genera un Voucher de demostración o personalizado para previsualización directa en el navegador
   */
  async generateSampleVoucher(customData?: Partial<VoucherData>): Promise<Buffer> {
    const sampleData: VoucherData = {
      bookingId: customData?.bookingId || 'bkg_sample_98452109',
      bookingReference: customData?.bookingReference || 'TR-2026-VIP99',
      guestName: customData?.guestName || 'Mauricio Gómez',
      guestEmail: customData?.guestEmail || 'mauricio@hotel-dev.com',
      guestPhone: customData?.guestPhone || '+57 300 456 7890',
      hotelName: customData?.hotelName || 'The Grand Mayan Riviera Luxury Palace',
      hotelAddress: customData?.hotelAddress || 'Km 48 Carretera Federal Cancún - Playa del Carmen',
      hotelCity: customData?.hotelCity || 'Riviera Maya, México',
      roomTypeName: customData?.roomTypeName || 'Royal Oceanfront Master Suite con Piscina Privada',
      checkInDate: customData?.checkInDate || '2026-11-20',
      checkOutDate: customData?.checkOutDate || '2026-11-25',
      checkInTime: customData?.checkInTime || '15:00',
      checkOutTime: customData?.checkOutTime || '11:00',
      nights: customData?.nights || 5,
      guestsCount: customData?.guestsCount || 2,
      totalAmount: customData?.totalAmount || 1250.0,
      currency: customData?.currency || 'USD',
      paymentId: customData?.paymentId || 'pi_3Mkd98201Kls8109',
      paymentMethod: customData?.paymentMethod || 'Visa Infinite Platinum (Stripe)',
      status: 'CONFIRMED',
      specialRequests:
        customData?.specialRequests || 'Piso alto, vista directa al atardecer, check-in anticipado',
    };

    return await this.voucherGeneratorService.generateVoucherPdf(sampleData);
  }

  /**
   * Obtiene el historial de notificaciones procesadas
   */
  getHistory(recipientEmail?: string): NotificationLogEntryDto[] {
    if (!recipientEmail) {
      return this.historyLogs;
    }

    const normalizedEmail = recipientEmail.toLowerCase();
    return this.historyLogs.filter((entry) => entry.recipient.toLowerCase() === normalizedEmail);
  }

  /**
   * Obtiene el estado del proveedor de correo (Gmail real o simulación)
   */
  getSmtpStatus() {
    return this.mailService.getProviderInfo();
  }

  private recordLog(
    type: NotificationType,
    recipient: string,
    subject: string,
    sendResult: EmailSendResult,
    durationMs: number,
    hasAttachment: boolean,
  ): NotificationLogEntryDto {
    const entry: NotificationLogEntryDto = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      recipient,
      subject,
      status: sendResult.success
        ? sendResult.simulated
          ? NotificationStatus.SIMULATED
          : NotificationStatus.SENT
        : NotificationStatus.FAILED,
      timestamp: new Date().toISOString(),
      durationMs,
      hasAttachment,
      previewUrl: typeof sendResult.previewUrl === 'string' ? sendResult.previewUrl : undefined,
      error: sendResult.error,
    };

    this.historyLogs.unshift(entry);
    if (this.historyLogs.length > this.MAX_HISTORY_ITEMS) {
      this.historyLogs.pop();
    }

    return entry;
  }
}
