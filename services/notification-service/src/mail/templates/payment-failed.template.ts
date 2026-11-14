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
  const rawAmount = Number(data.totalAmount) || 0;
  const copAmount = rawAmount > 0 && rawAmount < 10000 ? rawAmount * 4000 : rawAmount;
  const formattedAmount = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(copAmount);
  const retryUrl = data.retryPaymentUrl || 'http://localhost:5173';

  const bodyContent = `
    <p style="font-size: 16px; margin-top: 0;">
      Estimado/a <strong style="color: #13332E;">${data.guestName}</strong>,
    </p>
    <p>
      Te informamos que el pago o comprobante asociado a tu solicitud de reserva en <strong style="color: #13332E;">${data.hotelName}</strong> ha sido <span style="display: inline-block; background-color: #fee2e2; color: #991b1b; font-weight: 700; padding: 3px 10px; border-radius: 4px; font-size: 13px;">RECHAZADO / NO APROBADO</span>.
    </p>

    <!-- Tarjeta de Alerta de Motivo -->
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #B42318; border-radius: 6px; padding: 18px; margin: 20px 0;">
      <div style="font-weight: 700; color: #991b1b; font-size: 14px; margin-bottom: 6px;">
        Motivo reportado por Administración:
      </div>
      <div style="font-size: 14px; color: #b91c1c; font-weight: 600;">
        ${data.failureReason || 'Comprobante bancario no recibido o fondos no acreditados.'}
      </div>
    </div>

    <!-- Detalles de la Reserva -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF9F6; border: 1px solid #E5E2DC; border-radius: 8px; margin: 20px 0; padding: 16px; font-size: 14px; color: #2C2A25;">
      <tr>
        <td style="padding: 5px 0; color: #6E6B64; width: 40%;">Código de Reserva:</td>
        <td style="padding: 5px 0; font-family: monospace; font-weight: 700; color: #13332E;">${data.bookingId}</td>
      </tr>
      <tr>
        <td style="padding: 5px 0; color: #6E6B64;">Propiedad:</td>
        <td style="padding: 5px 0; font-weight: 600;">${data.hotelName}</td>
      </tr>
      <tr>
        <td style="padding: 5px 0; color: #6E6B64;">Habitación / Suite:</td>
        <td style="padding: 5px 0;">${data.roomTypeName}</td>
      </tr>
      <tr>
        <td style="padding: 5px 0; color: #6E6B64;">Valor de la Reserva:</td>
        <td style="padding: 5px 0; font-weight: 700; color: #B42318;">${formattedAmount} COP</td>
      </tr>
    </table>

    <div style="background-color: #FAF9F6; border: 1px solid #E5E2DC; border-radius: 6px; padding: 14px; margin: 20px 0; font-size: 13px; color: #6E6B64;">
      <strong>Estado del inventario:</strong> Las fechas seleccionadas han sido liberadas en el sistema. Si deseas volver a reservar o enviar un nuevo comprobante, puedes hacerlo directamente desde el portal o comunicándote a nuestra línea oficial de WhatsApp <strong>+57 304 659 8870</strong>.
    </div>
  `;

  return renderBaseTemplate({
    preheader: `Notificación sobre tu reserva ${data.bookingId} en ${data.hotelName}: Pago rechazado o no completado.`,
    title: `Pago No Aprobado — Reserva ${data.bookingId}`,
    bodyContent,
    actionButton: {
      text: 'Ir al Portal Travel & Resorts',
      url: retryUrl,
    },
    footerNotice: 'Notificación oficial emitida por el Departamento de Reservas & Pagos de Travel & Resorts.',
  });
}

