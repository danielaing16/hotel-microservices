import { renderBaseTemplate } from './base.template';

export interface RefundReceiptEmailData {
  guestName: string;
  bookingReference: string;
  refundId: string;
  hotelName: string;
  roomTypeName: string;
  refundAmount: number;
  originalAmount: number;
  currency?: string;
  reason?: string;
  processedAt?: string;
  portalUrl?: string;
}

export function renderRefundReceiptEmail(data: RefundReceiptEmailData): string {
  const currency = data.currency || 'USD';
  const portalUrl = data.portalUrl || 'http://localhost';
  const processedAt = data.processedAt || new Date().toLocaleString();

  const bodyContent = `
    <p style="font-size: 16px; margin-top: 0;">
      Estimado/a <strong style="color: #0f172a;">${data.guestName}</strong>,
    </p>
    <p>
      Te confirmamos que la solicitud de cancelación para la reserva <strong style="color: #4f46e5;">${data.bookingReference}</strong> ha sido procesada exitosamente y se ha emitido el respectivo <strong>reembolso financiero</strong>.
    </p>

    <!-- Comprobante de Reembolso -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0; overflow: hidden;">
      <tr>
        <td style="background-color: #0f172a; padding: 12px 18px; color: #ffffff;">
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">Comprobante Oficial de Reembolso:</span>
          <div style="font-size: 16px; font-weight: 700; color: #38bdf8; margin-top: 2px;">REF: ${data.refundId}</div>
        </td>
      </tr>
      <tr>
        <td style="padding: 18px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; color: #334155;">
            <tr>
              <td style="padding: 5px 0; color: #64748b; width: 42%;">Reserva Cancelada:</td>
              <td style="padding: 5px 0; font-weight: 600;">${data.bookingReference}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Hotel:</td>
              <td style="padding: 5px 0;">${data.hotelName}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Habitación:</td>
              <td style="padding: 5px 0;">${data.roomTypeName}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Importe Original Cobrado:</td>
              <td style="padding: 5px 0; text-decoration: line-through; color: #64748b;">${currency} $${Number(data.originalAmount).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Fecha de Procesamiento:</td>
              <td style="padding: 5px 0;">${processedAt}</td>
            </tr>
            ${
              data.reason
                ? `<tr>
                    <td style="padding: 5px 0; color: #64748b;">Motivo de Cancelación:</td>
                    <td style="padding: 5px 0; font-style: italic;">${data.reason}</td>
                  </tr>`
                : ''
            }
            <tr style="border-top: 1px dashed #cbd5e1;">
              <td style="padding: 10px 0 0 0; font-weight: 700; color: #0f172a;">MONTO REEMBOLSADO:</td>
              <td style="padding: 10px 0 0 0; font-size: 16px; font-weight: 800; color: #059669;">${currency} $${Number(data.refundAmount).toFixed(2)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Información Bancaria -->
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 14px; margin: 20px 0; font-size: 13px; color: #166534;">
      💳 <strong>Acreditación bancaria:</strong> Los fondos han sido reintegrados al mismo medio de pago utilizado al reservar (Stripe / Tarjeta). Dependiendo de las políticas de tu banco emisor, verás el saldo reflejado en tu estado de cuenta en un plazo habitual de 3 a 5 días hábiles.
    </div>

    <p style="font-size: 14px; color: #64748b;">
      Lamentamos que en esta ocasión no hayas podido concretar tu visita. Estaremos encantados de darte la bienvenida en un próximo viaje.
    </p>
  `;

  return renderBaseTemplate({
    preheader: `Comprobante de reembolso ${data.refundId} emitido para la reserva ${data.bookingReference}.`,
    title: `🧾 Comprobante de Reembolso: ${data.bookingReference}`,
    bodyContent,
    actionButton: {
      text: 'Ir al Portal Principal',
      url: portalUrl,
    },
    footerNotice: 'Documento generado automáticamente por el evento de compensación de cancelación y reembolso.',
  });
}

