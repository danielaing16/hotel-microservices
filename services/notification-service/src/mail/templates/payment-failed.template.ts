import { renderBaseTemplate } from './base.template';

export interface PaymentFailedEmailData {
  guestName: string;
  bookingId: string;
  hotelName: string;
  roomTypeName: string;
  totalAmount: number;
  currency?: string;
  failureReason: string;
  retryPaymentUrl?: string;
  expiresAt?: string;
}

export function renderPaymentFailedEmail(data: PaymentFailedEmailData): string {
  const currency = data.currency || 'USD';
  const retryUrl = data.retryPaymentUrl || 'http://localhost';

  const bodyContent = `
    <p style="font-size: 16px; margin-top: 0;">
      Estimado/a <strong style="color: #0f172a;">${data.guestName}</strong>,
    </p>
    <p>
      Te informamos que la transacción para completar el pago de tu reserva en <strong style="color: #0f172a;">${data.hotelName}</strong> no pudo ser procesada satisfactoriamente por la entidad bancaria o pasarela de pagos.
    </p>

    <!-- Tarjeta de Alerta de Error -->
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #ef4444; border-radius: 6px; padding: 18px; margin: 20px 0;">
      <div style="font-weight: 700; color: #991b1b; font-size: 14px; margin-bottom: 6px;">
        ⚠️ Motivo del fallo reportado:
      </div>
      <div style="font-size: 14px; color: #b91c1c; font-family: monospace;">
        ${data.failureReason || 'Fondos insuficientes o denegación preventiva por el banco emisor.'}
      </div>
    </div>

    <!-- Detalles de la Reserva en Riesgo -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0; padding: 16px; font-size: 14px; color: #334155;">
      <tr>
        <td style="padding: 4px 0; color: #64748b; width: 40%;">ID de Reserva:</td>
        <td style="padding: 4px 0; font-family: monospace; font-weight: 600;">${data.bookingId}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #64748b;">Habitación:</td>
        <td style="padding: 4px 0;">${data.roomTypeName}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #64748b;">Monto Pendiente:</td>
        <td style="padding: 4px 0; font-weight: 700; color: #ef4444;">${currency} $${Number(data.totalAmount).toFixed(2)}</td>
      </tr>
      ${
        data.expiresAt
          ? `<tr>
              <td style="padding: 4px 0; color: #64748b;">Expiración del Bloqueo:</td>
              <td style="padding: 4px 0; font-weight: 700; color: #d97706;">${data.expiresAt}</td>
            </tr>`
          : ''
      }
    </table>

    <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; padding: 14px; margin: 20px 0; font-size: 13px; color: #92400e;">
      ⏳ <strong>Aviso importante de disponibilidad:</strong> Tu habitación se encuentra protegida temporalmente por nuestro candado anti-overbooking. Si el pago no se completa antes de su expiración, el bloqueo será liberado automáticamente en inventario para otros usuarios.
    </div>

    <p style="font-size: 14px; color: #475569;">
      Te recomendamos verificar los fondos disponibles de tu tarjeta o intentar con un método de pago alternativo.
    </p>
  `;

  return renderBaseTemplate({
    preheader: `Alerta: Pago no completado para tu reserva en ${data.hotelName}. Intenta nuevamente.`,
    title: '⚠️ Notificación de Pago Fallido & Expiración de Reserva',
    bodyContent,
    actionButton: {
      text: 'Reintentar Pago Ahora',
      url: retryUrl,
    },
    footerNotice: 'Notificación generada automáticamente por el evento de compensación de Payments Service.',
  });
}

