import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { renderWelcomeEmail, WelcomeEmailData } from './templates/welcome.template';
import {
  renderBookingConfirmationEmail,
  BookingConfirmationEmailData,
} from './templates/booking-confirmation.template';
import {
  renderPaymentFailedEmail,
  PaymentFailedEmailData,
} from './templates/payment-failed.template';
import {
  renderCheckinReminderEmail,
  CheckinReminderEmailData,
} from './templates/checkin-reminder.template';
import {
  renderRefundReceiptEmail,
  RefundReceiptEmailData,
} from './templates/refund-receipt.template';

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  recipient: string;
  subject: string;
  previewUrl?: string | false;
  simulated?: boolean;
  error?: string;
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private fromAddress: string;
  private isConfiguredWithRealSmtp = false;
  private providerName = 'Ethereal (Simulación)';

  constructor(private readonly configService: ConfigService) {
    this.fromAddress =
      this.configService.get<string>('smtp.from') ||
      'Travel & Resorts <reservas@travel-resorts.com>';
  }

  async onModuleInit() {
    await this.initTransporter();
  }

  getProviderInfo(): { isReal: boolean; provider: string; from: string } {
    return {
      isReal: this.isConfiguredWithRealSmtp,
      provider: this.providerName,
      from: this.fromAddress,
    };
  }

  private async initTransporter() {
    const service = this.configService.get<string>('smtp.service');
    const host = this.configService.get<string>('smtp.host', 'smtp.gmail.com');
    const port = this.configService.get<number>('smtp.port', 465);
    const user = this.configService.get<string>('smtp.user', '');
    // Las app-passwords de Gmail se muestran en grupos de 4 con espacios, pero la
    // contraseña real no los contiene; se normalizan para evitar fallos 535 de auth.
    const pass = (this.configService.get<string>('smtp.pass', '') || '').replace(/\s+/g, '');
    const secure = this.configService.get<boolean>('smtp.secure', true);

    if (user && pass) {
      if (service === 'gmail' || host.includes('gmail')) {
        this.logger.log(`Conectando con Google Gmail SMTP (Cuenta: ${user})...`);
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass },
          pool: true,
          maxConnections: 5,
        });
        this.providerName = `Gmail Oficial (${user})`;
      } else {
        this.logger.log(`Configurando Nodemailer con servidor SMTP: ${host}:${port} (${user})`);
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass },
        });
        this.providerName = `SMTP: ${host}:${port}`;
      }

      // Verificar que las credenciales de correo sean válidas al arrancar
      try {
        await this.transporter.verify();
        this.logger.log(`✅ [Email Delivery Activo] Conexión SMTP verificada y autenticada con éxito.`);
        this.isConfiguredWithRealSmtp = true;
      } catch (verifyErr) {
        this.logger.error(
          `❌ [SMTP Error] No se pudo autenticar con el servidor de correo (${verifyErr.message}). Verifica SMTP_USER y SMTP_PASS.`,
        );
        this.logger.warn('Activando transporte seguro de respaldo Ethereal para garantizar continuidad de la app.');
        await this.initEtherealFallback();
      }
    } else {
      this.logger.warn(
        'No se detectaron credenciales SMTP_USER / SMTP_PASS en el entorno. Inicializando modo de desarrollo con previsualización Ethereal/Simulada.',
      );
      await this.initEtherealFallback();
    }
  }

  private async initEtherealFallback() {
    this.isConfiguredWithRealSmtp = false;
    this.providerName = 'Ethereal Mail (Simulación Sandbox)';
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.logger.log(`Transportador Ethereal de prueba inicializado exitosamente (${testAccount.user})`);
    } catch (err) {
      this.logger.warn(
        `No se pudo conectar con Ethereal (${err.message}). Utilizando transporte en memoria JSON para logs directos.`,
      );
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  private async sendMail(options: {
    to: string;
    subject: string;
    html: string;
    attachments?: Array<{
      filename: string;
      content: Buffer | string;
      contentType?: string;
    }>;
  }): Promise<EmailSendResult> {
    try {
      if (!this.transporter) {
        await this.initTransporter();
      }

      const mailOptions = {
        from: this.fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      const previewUrl = nodemailer.getTestMessageUrl(info);

      this.logger.log(
        `✉️ Correo enviado satisfactoriamente a: ${options.to} | Asunto: "${options.subject}" | MessageId: ${info.messageId}`,
      );

      if (previewUrl) {
        this.logger.log(`🔗 Vista previa del correo electrónico (Ethereal): ${previewUrl}`);
      }

      return {
        success: true,
        messageId: info.messageId,
        recipient: options.to,
        subject: options.subject,
        previewUrl: previewUrl || undefined,
        simulated: !this.isConfiguredWithRealSmtp,
      };
    } catch (error) {
      this.logger.error(
        `Error despachando correo a ${options.to} (${options.subject}): ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        recipient: options.to,
        subject: options.subject,
        error: error.message,
      };
    }
  }

  /**
   * 1. Envía correo de bienvenida tras registro de usuario
   */
  async sendWelcomeEmail(
    to: string,
    data: WelcomeEmailData,
  ): Promise<EmailSendResult> {
    const html = renderWelcomeEmail(data);
    return await this.sendMail({
      to,
      subject: '🎉 ¡Bienvenido a Travel & Resorts! Cuenta creada con éxito',
      html,
    });
  }

  /**
   * 2. Envía confirmación de reserva con el Voucher PDF adjunto
   */
  async sendBookingConfirmationEmail(
    to: string,
    data: BookingConfirmationEmailData,
    voucherPdfBuffer?: Buffer,
  ): Promise<EmailSendResult> {
    const html = renderBookingConfirmationEmail(data);

    const attachments = [];
    if (voucherPdfBuffer) {
      attachments.push({
        filename: `voucher-reserva-${data.bookingReference}.pdf`,
        content: voucherPdfBuffer,
        contentType: 'application/pdf',
      });
    }

    return await this.sendMail({
      to,
      subject: `🏨 Confirmación de Reserva [${data.bookingReference}] - ${data.hotelName}`,
      html,
      attachments,
    });
  }

  /**
   * 3. Envía notificación de pago fallido y recordatorio de expiración
   */
  async sendPaymentFailedEmail(
    to: string,
    data: PaymentFailedEmailData,
  ): Promise<EmailSendResult> {
    const html = renderPaymentFailedEmail(data);
    return await this.sendMail({
      to,
      subject: `⚠️ Pago no completado para tu reserva en ${data.hotelName} - Reintento necesario`,
      html,
    });
  }

  /**
   * 4. Envía recordatorio de check-in 24 horas antes de la llegada
   */
  async sendCheckinReminderEmail(
    to: string,
    data: CheckinReminderEmailData,
  ): Promise<EmailSendResult> {
    const html = renderCheckinReminderEmail(data);
    return await this.sendMail({
      to,
      subject: `⏰ ¡Tu viaje comienza mañana! Recordatorio de Check-in para ${data.hotelName}`,
      html,
    });
  }

  /**
   * 5. Envía comprobante de reembolso en caso de cancelación
   */
  async sendRefundReceiptEmail(
    to: string,
    data: RefundReceiptEmailData,
  ): Promise<EmailSendResult> {
    const html = renderRefundReceiptEmail(data);
    return await this.sendMail({
      to,
      subject: `🧾 Comprobante Oficial de Reembolso [${data.bookingReference}]`,
      html,
    });
  }
}

