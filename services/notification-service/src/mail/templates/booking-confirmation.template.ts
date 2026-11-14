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
  const rawAmount = Number(data.totalAmount) || 0;
  const copAmount = rawAmount > 0 && rawAmount < 10000 ? rawAmount * 4000 : rawAmount;
  const formattedAmount = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(copAmount);
  const dashboardUrl = data.dashboardUrl || 'http://localhost:5173';

  const bodyContent = `
    <p style="font-size: 16px; margin-top: 0;">
      Estimado/a <strong style="color: #13332E;">${data.guestName}</strong>,
    </p>
    <p>
      Nos complace informarte que tu pago ha sido verificado por administración y tu reserva se encuentra <span style="display: inline-block; background-color: #d1fae5; color: #065f46; font-weight: 700; padding: 3px 10px; border-radius: 4px; font-size: 13px;">PAGO ACEPTADO &amp; RESERVA CONFIRMADA</span>.
    </p>

    <!-- Resumen de Reserva -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF9F6; border: 1px solid #E5E2DC; border-radius: 8px; margin: 20px 0; overflow: hidden;">
      <tr>
        <td style="background-color: #13332E; padding: 14px 18px; color: #FAF9F6;">
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #D4C5A9;">Código Oficial de Confirmación:</span>
          <div style="font-size: 20px; font-weight: 800; color: #FAF9F6; margin-top: 3px; letter-spacing: 0.5px;">${data.bookingReference}</div>
        </td>
      </tr>
      <tr>
        <td style="padding: 18px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; color: #2C2A25;">
            <tr>
              <td style="padding: 6px 0; color: #6E6B64; width: 40%;">Hotel &amp; Sede:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #13332E;">${data.hotelName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6E6B64;">Ubicación:</td>
              <td style="padding: 6px 0;">${data.hotelAddress}, ${data.hotelCity}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6E6B64;">Habitación / Suite:</td>
              <td style="padding: 6px 0; font-weight: 600;">${data.roomTypeName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6E6B64;">Check-In:</td>
              <td style="padding: 6px 0; color: #13332E; font-weight: 700;">${data.checkInDate} (a partir de las 15:00 hrs)</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6E6B64;">Check-Out:</td>
              <td style="padding: 6px 0; color: #8C703E; font-weight: 700;">${data.checkOutDate} (hasta las 12:00 hrs)</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6E6B64;">Duración &amp; Huéspedes:</td>
              <td style="padding: 6px 0;">${data.nights} Noche(s) &bull; ${data.guestsCount} Persona(s)</td>
            </tr>
            <tr style="border-top: 1px dashed #E5E2DC;">
              <td style="padding: 12px 0 0 0; color: #6E6B64; font-weight: 700;">Valor Confirmado:</td>
              <td style="padding: 12px 0 0 0; font-size: 17px; font-weight: 800; color: #13332E;">${formattedAmount} COP</td>
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

