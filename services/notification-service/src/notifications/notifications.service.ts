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
  private readonly inFlightKeys = new Set<string>();

  private checkDuplicate(key: string): NotificationLogEntryDto | null {
    const existing = this.recentDispatchKeys.get(key);
    if (existing && Date.now() - new Date(existing.timestamp).getTime() < 20000) {
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
      loginUrl: event.loginUrl || process.env.FRONTEND_URL || 'http://localhost:5173',
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

  private readonly HOTEL_ADDRESSES: Record<string, { address: string; city: string }> = {
    'Cartagena Luxury Beach & Spa Resort': {
      address: 'Carrera 1 # 12-118, Bocagrande',
      city: 'Cartagena, Colombia',
    },
    'Medellín SkyView Boutique Hotel': {
      address: 'Calle 10A # 36-24, El Poblado',
      city: 'Medellín, Colombia',
    },
    'San Andrés Island Paradise Resort': {
      address: 'Avenida Colombia # 1-19, Punta Hansa',
      city: 'San Andrés Islas, Colombia',
    },
    'Bogotá Grand Plaza & Financial Center': {
      address: 'Carrera 7 # 71-52, Zona Financiera',
      city: 'Bogotá D.C., Colombia',
    },
    'Santa Marta Sierra & Mar Eco-Lodge': {
      address: 'Km 32 Vía Santa Marta - Riohacha, Costeño Beach',
      city: 'Santa Marta, Colombia',
    },
    'Eje Cafetero Hacienda Coloma Boutique': {
      address: 'Km 5 Vía Armenia - Montenegro, Vereda El Roble',
      city: 'Armenia, Quindío, Colombia',
    },
  };

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
    const userEmail = rawEvent?.userEmail || rawEvent?.email || 'isaconsii08@gmail.com';
    let userName =
      rawEvent?.userName || rawEvent?.guestName || (userEmail ? userEmail.split('@')[0] : 'Huésped Travel & Resorts');
    if (userEmail.toLowerCase().includes('isaconsii') && (!userName || userName.toLowerCase().includes('huesped'))) {
      userName = 'Isabela Contreras';
    }
    const hotelName = rawEvent?.hotelName || 'Bogotá Grand Plaza & Financial Center';
    const hotelInfo = this.HOTEL_ADDRESSES[hotelName] || {
      address: rawEvent?.hotelAddress && !rawEvent.hotelAddress.includes('oficial')
        ? rawEvent.hotelAddress
        : 'Carrera 7 # 71-52, Zona Financiera',
      city: rawEvent?.hotelCity && rawEvent.hotelCity !== 'Colombia'
        ? rawEvent.hotelCity
        : 'Bogotá D.C., Colombia',
    };
    const hotelAddress = hotelInfo.address;
    const hotelCity = hotelInfo.city;
    const roomTypeName = rawEvent?.roomTypeName || rawEvent?.roomName || 'Suite Ejecutiva Diplomática';
    const checkInDate = rawEvent?.checkInDate || rawEvent?.checkIn || '2026-11-20';
    const checkOutDate = rawEvent?.checkOutDate || rawEvent?.checkOut || '2026-11-25';
    const nights = Number(rawEvent?.nights || rawEvent?.nightsCount || 5);
    const guestsCount = Number(rawEvent?.guestsCount || 2);
    const rawAmount = Number(rawEvent?.totalAmount || rawEvent?.amount || 0);
    const totalAmount = rawAmount > 0 && rawAmount < 50000 ? rawAmount * 4000 : rawAmount;
    const currency = 'COP';

    const dedupKey = `CONFIRMED:${bookingReference}:${(userEmail || '').toLowerCase()}`;
    const dup = this.checkDuplicate(dedupKey);
    if (dup) {
      return { log: dup, pdfBuffer: Buffer.alloc(0) };
    }
    if (this.inFlightKeys.has(dedupKey)) {
      const placeholderLog: NotificationLogEntryDto = {
        id: `in-flight-${Date.now()}`,
        type: NotificationType.BOOKING_CONFIRMATION,
        status: NotificationStatus.SENT,
        recipient: userEmail,
        subject: `🏨 Confirmación de Reserva [${bookingReference}] - ${hotelName}`,
        hasAttachment: true,
        durationMs: 0,
        timestamp: new Date().toISOString(),
      };
      return { log: placeholderLog, pdfBuffer: Buffer.alloc(0) };
    }
    this.inFlightKeys.add(dedupKey);

    try {
      this.logger.log(
        `[Event: booking.confirmed] Procesando confirmación y voucher PDF para: ${bookingReference} (${userEmail})`,
      );

      // Preparar estructura de datos para el motor PDFKit
      const voucherData: VoucherData = {
        bookingId: rawEvent?.bookingId || rawEvent?.id || bookingReference,
        bookingReference,
        guestName: userName,
        guestEmail: userEmail,
        guestPhone: rawEvent?.userPhone || rawEvent?.guestPhone || '+57 304 659 8870',
        hotelName,
        hotelAddress,
        hotelCity,
        roomTypeName,
        checkInDate,
        checkOutDate,
        checkInTime: rawEvent?.checkInTime || '15:00',
        checkOutTime: rawEvent?.checkOutTime || '11:00',
        nights,
        guestsCount,
        totalAmount,
        currency,
        paymentId: rawEvent?.paymentId || rawEvent?.transactionReference || `PAY-${bookingReference}`,
        paymentMethod: rawEvent?.paymentMethod || 'Transferencia Bancaria / WhatsApp Directo',
        specialRequests: rawEvent?.specialRequests || 'Estancia garantizada y verificada en plataforma',
        status: 'CONFIRMED',
        adminName: 'Mauricio Medina',
        adminEmail: 'mauromedina2508@gmail.com',
        adminPhone: '+57 304 659 8870',
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
          dashboardUrl: rawEvent?.dashboardUrl || process.env.FRONTEND_URL || 'http://localhost:5173',
        },
        pdfBuffer,
      );

      const log = this.recordLog(
        NotificationType.BOOKING_CONFIRMATION,
        userEmail,
        `🏨 Confirmación de Reserva [${bookingReference}] - ${hotelName}`,
        result,
        Date.now() - start,
        true,
      );

      this.recentDispatchKeys.set(dedupKey, log);
      return { log, pdfBuffer };
    } finally {
      this.inFlightKeys.delete(dedupKey);
    }
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
      `[Event: payment.failed] Notificando fallo de pago para la reserva ${bookingRef} (${userEmail})`,
    );

    const result = await this.mailService.sendPaymentFailedEmail(userEmail, {
      guestName: userName,
      bookingId: bookingRef,
      hotelName,
      roomTypeName,
      totalAmount,
      currency: rawEvent?.currency || 'COP',
      failureReason,
      retryPaymentUrl: rawEvent?.retryPaymentUrl || process.env.FRONTEND_URL || 'http://localhost:5173',
      expiresAt: rawEvent?.expiresAt || 'Fechas liberadas en inventario',
    });

    const log = this.recordLog(
      NotificationType.PAYMENT_FAILED,
      userEmail,
      `⚠️ Pago no completado para tu reserva en ${hotelName}`,
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
  async handleRefund(rawEvent: any): Promise<NotificationLogEntryDto> {
    const start = Date.now();
    const bookingReference =
      rawEvent?.bookingReference || rawEvent?.bookingCode || rawEvent?.bookingId || 'TR-2026';
    const userEmail = rawEvent?.userEmail || rawEvent?.email;
    if (!userEmail) {
      this.logger.warn(`[Event: payment.refunded] Ignorado para ${bookingReference}: sin userEmail`);
      return null as any;
    }

    const dedupKey = `REFUND:${bookingReference}:${userEmail.toLowerCase()}`;
    const dup = this.checkDuplicate(dedupKey);
    if (dup) return dup;
    if (this.inFlightKeys.has(dedupKey)) return null as any;
    this.inFlightKeys.add(dedupKey);

    try {
      const userName = rawEvent?.userName || rawEvent?.guestName || userEmail.split('@')[0];
      const hotelName = rawEvent?.hotelName || 'Bogotá Grand Plaza & Financial Center';
      const roomTypeName = rawEvent?.roomTypeName || rawEvent?.roomName || 'Suite Reservada';
      const rawRefund = Number(rawEvent?.refundAmount || rawEvent?.amount || 0);
      const refundAmount = rawRefund > 0 && rawRefund < 50000 ? rawRefund * 4000 : rawRefund;
      const rawOrig = Number(rawEvent?.originalAmount || rawEvent?.amount || rawRefund || 0);
      const originalAmount = rawOrig > 0 && rawOrig < 50000 ? rawOrig * 4000 : rawOrig;
      const refundId = rawEvent?.refundId || `REF-${bookingReference}`;

      this.logger.log(
        `[Event: payment.refunded] Enviando comprobante de reembolso a: ${userEmail} [${bookingReference}]`,
      );

      const result = await this.mailService.sendRefundReceiptEmail(userEmail, {
        guestName: userName,
        bookingReference,
        refundId,
        hotelName,
        roomTypeName,
        refundAmount,
        originalAmount,
        currency: 'COP',
        reason: rawEvent?.reason || 'Reembolso autorizado por administración',
        portalUrl: rawEvent?.portalUrl || process.env.FRONTEND_URL || 'http://localhost:5173',
      });

      const log = this.recordLog(
        NotificationType.REFUND_RECEIPT,
        userEmail,
        `🧾 Comprobante Oficial de Reembolso [${bookingReference}] - ${hotelName}`,
        result,
        Date.now() - start,
        false,
      );
      this.recentDispatchKeys.set(dedupKey, log);
      return log;
    } finally {
      this.inFlightKeys.delete(dedupKey);
    }
  }

  /**
   * Genera un Voucher personalizado o con datos oficiales de la plataforma para previsualización directa
   */
  async generateSampleVoucher(customData?: any): Promise<Buffer> {
    const hotelName = customData?.hotelName || 'Bogotá Grand Plaza & Financial Center';
    const hotelInfo = this.HOTEL_ADDRESSES[hotelName] || {
      address: customData?.hotelAddress && !customData.hotelAddress.includes('oficial')
        ? customData.hotelAddress
        : 'Carrera 7 # 71-52, Zona Financiera',
      city: customData?.hotelCity && customData.hotelCity !== 'Colombia'
        ? customData.hotelCity
        : 'Bogotá D.C., Colombia',
    };

    const guestEmail =
      customData?.guestEmail ||
      customData?.userEmail ||
      customData?.email ||
      'isaconsii08@gmail.com';

    let guestName =
      customData?.guestName ||
      customData?.userName ||
      customData?.name;
    if (!guestName || guestName === 'Huésped' || guestName === 'Huésped VIP') {
      if (guestEmail.toLowerCase().includes('isaconsii')) {
        guestName = 'Isabela Contreras';
      } else {
        guestName = guestEmail.split('@')[0];
      }
    }

    const guestPhone =
      customData?.guestPhone ||
      customData?.userPhone ||
      customData?.phone ||
      '+57 304 659 8870';

    const rawAmount = Number(customData?.totalAmount || customData?.amount || 900000);
    const totalAmount = rawAmount > 0 && rawAmount < 50000 ? rawAmount * 4000 : rawAmount;

    const sampleData: VoucherData = {
      bookingId: customData?.bookingId || `bkg_${Date.now()}`,
      bookingReference:
        customData?.bookingReference ||
        customData?.bookingCode ||
        `TR-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      guestName,
      guestEmail,
      guestPhone,
      hotelName,
      hotelAddress: hotelInfo.address,
      hotelCity: hotelInfo.city,
      roomTypeName: customData?.roomTypeName || customData?.roomName || 'Suite Ejecutiva Diplomática',
      checkInDate: customData?.checkInDate || customData?.checkIn || '2026-11-20',
      checkOutDate: customData?.checkOutDate || customData?.checkOut || '2026-11-25',
      checkInTime: customData?.checkInTime || '15:00',
      checkOutTime: customData?.checkOutTime || '11:00',
      nights: Number(customData?.nights || customData?.nightsCount || 5),
      guestsCount: Number(customData?.guestsCount || 2),
      totalAmount,
      currency: 'COP',
      paymentId: customData?.paymentId || customData?.transactionReference || `PAY-${Date.now().toString(36).toUpperCase()}`,
      paymentMethod: customData?.paymentMethod || 'Transferencia Bancaria / WhatsApp Directo',
      status: customData?.status || 'CONFIRMED',
      specialRequests: customData?.specialRequests || 'Estancia garantizada y verificada en plataforma',
      adminName: 'Mauricio Medina',
      adminEmail: 'mauromedina2508@gmail.com',
      adminPhone: '+57 304 659 8870',
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
