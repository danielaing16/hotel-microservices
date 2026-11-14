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

  private readonly recentDispatchKeys = new Map<string, NotificationLogEntryDto>();

  private checkDuplicate(key: string): NotificationLogEntryDto | null {
    const existing = this.recentDispatchKeys.get(key);
    if (existing && Date.now() - new Date(existing.timestamp).getTime() < 15000) {
      return existing;
    }
    return null;
  }

  async configureSmtp(user: string, pass: string) {
    return await this.mailService.configureSmtpRuntime(user, pass);
  }

  /**
   * 1. Manejo del evento de Registro de Usuario (user.registered)
   */
  async handleUserRegistered(event: any): Promise<NotificationLogEntryDto> {
    const email = event?.email || event?.userEmail;
    if (!email) {
      throw new Error('Correo electrónico del usuario requerido para notificación de bienvenida');
    }
    const dedupKey = `WELCOME:${email.toLowerCase()}`;
    const dup = this.checkDuplicate(dedupKey);
    if (dup) return dup;

    const start = Date.now();
    this.logger.log(`[Event: user.registered] Procesando bienvenida para: ${email}`);

    const result = await this.mailService.sendWelcomeEmail(email, {
      firstName: event.firstName || email.split('@')[0],
      lastName: event.lastName || '',
      email,
      loginUrl: event.loginUrl || 'http://localhost:5173',
    });

    const log = this.recordLog(
      NotificationType.WELCOME,
      email,
      '🎉 ¡Bienvenido a Travel & Resorts! Cuenta creada con éxito',
      result,
      Date.now() - start,
      false,
    );
    this.recentDispatchKeys.set(dedupKey, log);
    return log;
  }

  /**
   * 2. Manejo del evento de Confirmación de Reserva (booking.confirmed / payment.succeeded)
   * Genera el voucher PDF con código QR y lo adjunta al correo electrónico
   */
  async handleBookingConfirmed(
    rawEvent: any,
  ): Promise<{ log: NotificationLogEntryDto; pdfBuffer: Buffer }> {
    const start = Date.now();
    const bookingReference =
      rawEvent?.bookingReference || rawEvent?.bookingCode || rawEvent?.bookingId || 'TR-2026-CONF';
    const userEmail = rawEvent?.userEmail || rawEvent?.email;
    const userName =
      rawEvent?.userName || (userEmail ? userEmail.split('@')[0] : 'Huésped Travel & Resorts');
    const hotelName = rawEvent?.hotelName || 'Travel & Resorts — Luxury Sanctuary';
    const hotelAddress = rawEvent?.hotelAddress || 'Sede Principal Exclusiva';
    const hotelCity = rawEvent?.hotelCity || 'Colombia';
    const roomTypeName = rawEvent?.roomTypeName || rawEvent?.roomName || 'Suite de Lujo';
    const checkInDate = rawEvent?.checkInDate || rawEvent?.checkIn || '2026-11-15';
    const checkOutDate = rawEvent?.checkOutDate || rawEvent?.checkOut || '2026-11-18';
    const nights = Number(rawEvent?.nights || rawEvent?.nightsCount || 2);
    const guestsCount = Number(rawEvent?.guestsCount || 2);
    const rawAmount = Number(rawEvent?.totalAmount || rawEvent?.amount || 0);
    const totalAmount = rawAmount > 0 && rawAmount < 10000 ? rawAmount * 4000 : rawAmount;
    const currency = 'COP';

    const dedupKey = `CONFIRMED:${bookingReference}:${(userEmail || '').toLowerCase()}`;
    const dup = this.checkDuplicate(dedupKey);
    if (dup) {
      return { log: dup, pdfBuffer: Buffer.alloc(0) };
    }

    this.logger.log(
      `[Event: booking.confirmed] Procesando confirmación y voucher PDF para: ${bookingReference} (${userEmail})`,
    );

    // Preparar estructura de datos para el motor PDFKit
    const voucherData: VoucherData = {
      bookingId: rawEvent?.bookingId || rawEvent?.id || bookingReference,
      bookingReference,
      guestName: userName,
      guestEmail: userEmail,
      guestPhone: rawEvent?.userPhone || '+57 304 659 8870',
      hotelName,
      hotelAddress,
      hotelCity,
      roomTypeName,
      checkInDate,
      checkOutDate,
      checkInTime: rawEvent?.checkInTime || '15:00',
      checkOutTime: rawEvent?.checkOutTime || '12:00',
      nights,
      guestsCount,
      totalAmount,
      currency,
      paymentId: rawEvent?.paymentId || rawEvent?.transactionReference || `PAY-${bookingReference}`,
      paymentMethod: rawEvent?.paymentMethod || 'Transferencia / WhatsApp Aprobada',
      specialRequests: rawEvent?.specialRequests,
      status: 'CONFIRMED',
    };

    // Generar el Voucher en PDF de forma asíncrona y eficiente
    const pdfBuffer = await this.voucherGeneratorService.generateVoucherPdf(voucherData);

    // Despachar el correo electrónico con el PDF adjunto
    const result = await this.mailService.sendBookingConfirmationEmail(
      userEmail,
      {
        guestName: userName,
        bookingReference,
        hotelName,
        hotelAddress,
        hotelCity,
        roomTypeName,
        checkInDate,
        checkOutDate,
        nights,
        guestsCount,
        totalAmount,
        currency,
        dashboardUrl: rawEvent?.dashboardUrl || 'http://localhost:5173',
      },
      pdfBuffer,
    );

    const log = this.recordLog(
      NotificationType.BOOKING_CONFIRMATION,
      userEmail,
      `Pago Aceptado y Reserva Confirmada [${bookingReference}] - ${hotelName}`,
      result,
      Date.now() - start,
      true,
    );

    this.recentDispatchKeys.set(dedupKey, log);
    return { log, pdfBuffer };
  }

  /**
   * 3. Manejo del evento de Pago Fallido / Reserva Rechazada (payment.failed)
   */
  async handlePaymentFailed(rawEvent: any): Promise<NotificationLogEntryDto> {
    const start = Date.now();
    const bookingRef =
      rawEvent?.bookingCode || rawEvent?.bookingReference || rawEvent?.bookingId || 'TR-2026';
    const userEmail = rawEvent?.userEmail || rawEvent?.email;
    if (!userEmail) {
      this.logger.warn(`[Event: payment.failed] Ignorado para ${bookingRef}: sin userEmail`);
      return null as any;
    }

    const dedupKey = `FAILED:${bookingRef}:${userEmail.toLowerCase()}`;
    const dup = this.checkDuplicate(dedupKey);
    if (dup) return dup;

    const userName = rawEvent?.userName || userEmail.split('@')[0];
    const hotelName = rawEvent?.hotelName || 'Travel & Resorts';
    const roomTypeName = rawEvent?.roomTypeName || rawEvent?.roomName || 'Suite Reservada';
    const rawAmount = Number(rawEvent?.totalAmount || rawEvent?.amount || 0);
    const totalAmount = rawAmount > 0 && rawAmount < 10000 ? rawAmount * 4000 : rawAmount;
    const failureReason =
      rawEvent?.failureReason ||
      rawEvent?.reason ||
      'Comprobante bancario no recibido o fondos no acreditados';

    this.logger.warn(
      `[Event: payment.failed] Notificando rechazo de pago para la reserva ${bookingRef} (${userEmail})`,
    );

    const result = await this.mailService.sendPaymentFailedEmail(userEmail, {
      guestName: userName,
      bookingId: bookingRef,
      hotelName,
      roomTypeName,
      totalAmount,
      currency: 'COP',
      failureReason,
      retryPaymentUrl: rawEvent?.retryPaymentUrl || 'http://localhost:5173',
      expiresAt: rawEvent?.expiresAt || 'Fechas liberadas en inventario',
    });

    const log = this.recordLog(
      NotificationType.PAYMENT_FAILED,
      userEmail,
      `Pago No Aprobado — Reserva [${bookingRef}] en ${hotelName}`,
      result,
      Date.now() - start,
      false,
    );
    this.recentDispatchKeys.set(dedupKey, log);
    return log;
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
