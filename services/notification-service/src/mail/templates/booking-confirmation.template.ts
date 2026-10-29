import { renderBaseTemplate } from './base.template';

export interface BookingConfirmationEmailData {
  guestName: string;
  bookingReference: string;
  hotelName: string;
  hotelAddress: string;
  hotelCity: string;
  roomTypeName: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guestsCount: number;
  totalAmount: number;
  currency?: string;
  dashboardUrl?: string;
}

export function renderBookingConfirmationEmail(data: BookingConfirmationEmailData): string {
  const currency = data.currency || 'USD';
  const dashboardUrl = data.dashboardUrl || 'http://localhost';

  const bodyContent = `
    <p style="font-size: 16px; margin-top: 0;">
      Estimado/a <strong style="color: #0f172a;">${data.guestName}</strong>,
    </p>
    <p>
      ¡Tu reserva ha sido <span style="display: inline-block; background-color: #d1fae5; color: #065f46; font-weight: 700; padding: 2px 8px; border-radius: 4px; font-size: 13px;">CONFIRMADA Y PAGADA</span> con éxito!
    </p>

    <!-- Resumen de Reserva -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0; overflow: hidden;">
      <tr>
        <td style="background-color: #1e1b4b; padding: 12px 18px; color: #ffffff;">
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #cbd5e1;">Código de Confirmación:</span>
          <div style="font-size: 18px; font-weight: 800; color: #fbbf24; margin-top: 2px;">${data.bookingReference}</div>
        </td>
      </tr>
      <tr>
        <td style="padding: 18px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; color: #334155;">
            <tr>
              <td style="padding: 5px 0; color: #64748b; width: 40%;">Hotel & Sede:</td>
              <td style="padding: 5px 0; font-weight: 600; color: #0f172a;">${data.hotelName}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Ubicación:</td>
              <td style="padding: 5px 0;">${data.hotelAddress}, ${data.hotelCity}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Tipo de Habitación:</td>
              <td style="padding: 5px 0; font-weight: 600;">${data.roomTypeName}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Check-In:</td>
              <td style="padding: 5px 0; color: #4f46e5; font-weight: 700;">${data.checkInDate} (a partir de las 15:00 hrs)</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Check-Out:</td>
              <td style="padding: 5px 0; color: #4f46e5; font-weight: 700;">${data.checkOutDate} (hasta las 11:00 hrs)</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Duración & Huéspedes:</td>
              <td style="padding: 5px 0;">${data.nights} Noche(s) &bull; ${data.guestsCount} Persona(s)</td>
            </tr>
            <tr style="border-top: 1px dashed #cbd5e1;">
              <td style="padding: 10px 0 0 0; color: #64748b; font-weight: 700;">Total Pagado:</td>
              <td style="padding: 10px 0 0 0; font-size: 16px; font-weight: 800; color: #059669;">${currency} $${Number(data.totalAmount).toFixed(2)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Aviso del Voucher Adjunto con QR -->
    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: left;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td width="36" valign="top" style="font-size: 26px; line-height: 1;">📎</td>
          <td style="padding-left: 10px;">
            <strong style="color: #1e40af; font-size: 14px; display: block; margin-bottom: 4px;">
              Voucher Oficial de Confirmación Adjunto en PDF
            </strong>
            <span style="font-size: 13px; color: #1e3a8a; line-height: 1.4; display: block;">
              Hemos adjuntado tu <strong>Voucher de Confirmación con Código QR</strong> a este correo. Puedes descargarlo, guardarlo en tu teléfono o imprimirlo para mostrarlo en recepción al llegar y disfrutar de un Check-in rápido y sin esperas.
            </span>
          </td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #64748b;">
      ¿Necesitas modificar fechas o solicitar servicios adicionales? Puedes gestionar tu reserva desde tu panel o comunicarte con nuestro servicio de conserjería.
    </p>
  `;

  return renderBaseTemplate({
    preheader: `¡Tu reserva ${data.bookingReference} en ${data.hotelName} está confirmada! Voucher PDF adjunto.`,
    title: `🏨 Reserva Confirmada: ${data.bookingReference}`,
    bodyContent,
    actionButton: {
      text: 'Ver Mi Reserva en el Portal',
      url: dashboardUrl,
    },
    footerNotice: 'Este comprobante oficial fue generado tras la confirmación exitosa del cobro en la pasarela de pagos.',
  });
}

