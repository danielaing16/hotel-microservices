import { renderBaseTemplate } from './base.template';

export interface CheckinReminderEmailData {
  guestName: string;
  bookingReference: string;
  hotelName: string;
  hotelAddress: string;
  hotelCity: string;
  roomTypeName: string;
  checkInDate: string;
  checkInTime?: string;
  specialInstructions?: string;
  portalUrl?: string;
}

export function renderCheckinReminderEmail(data: CheckinReminderEmailData): string {
  const portalUrl = data.portalUrl || 'http://localhost';
  const checkInTime = data.checkInTime || '15:00';

  const bodyContent = `
    <p style="font-size: 16px; margin-top: 0;">
      ¡Tu viaje está a punto de comenzar, <strong style="color: #4f46e5;">${data.guestName}</strong>!
    </p>
    <p>
      Te recordamos que tu llegada a <strong style="color: #0f172a;">${data.hotelName}</strong> está programada para mañana <strong>${data.checkInDate}</strong>. El equipo del hotel está listo para recibirte y brindarte una experiencia inigualable.
    </p>

    <!-- Caja de Recordatorio de Llegada -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0; padding: 20px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; color: #334155;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 38%;">Código de Reserva:</td>
          <td style="padding: 6px 0; font-weight: 800; color: #d97706; font-size: 15px;">${data.bookingReference}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Hotel:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${data.hotelName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Dirección:</td>
          <td style="padding: 6px 0;">${data.hotelAddress}, ${data.hotelCity}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Habitación:</td>
          <td style="padding: 6px 0; font-weight: 600;">${data.roomTypeName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Horario de Check-In:</td>
          <td style="padding: 6px 0; color: #059669; font-weight: 700;">A partir de las ${checkInTime} hrs</td>
        </tr>
      </table>
    </div>

    <!-- Guía Rápida para el Check-In -->
    <div style="background-color: #f1f5f9; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 6px; margin: 20px 0;">
      <div style="font-weight: 700; color: #1e293b; font-size: 14px; margin-bottom: 8px;">
        🛎️ Recomendaciones para tu llegada:
      </div>
      <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; color: #475569; line-height: 1.5;">
        <li style="margin-bottom: 5px;">Ten a mano tu <strong>código QR</strong> del voucher en el móvil para agilizar el registro en recepción.</li>
        <li style="margin-bottom: 5px;">Presenta identificación oficial vigente (DNI, Cédula o Pasaporte) de cada huésped registrado.</li>
        <li>Si llegas antes de las ${checkInTime} hrs, con gusto resguardaremos tu equipaje mientras exploras las instalaciones o la ciudad.</li>
      </ul>
    </div>

    ${
      data.specialInstructions
        ? `<div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 6px; padding: 12px; margin: 20px 0; font-size: 13px; color: #854d0e;">
            <strong>Nota especial de la sede:</strong> ${data.specialInstructions}
          </div>`
        : ''
    }

    <p style="font-size: 14px; color: #64748b;">
      ¡Te deseamos un excelente viaje! Nuestro personal de conserjería estará atento a tu llegada.
    </p>
  `;

  return renderBaseTemplate({
    preheader: `¡Tu estadía comienza mañana! Recordatorio de Check-in para la reserva ${data.bookingReference} en ${data.hotelName}.`,
    title: `⏰ Recordatorio de Check-In: ¡Tu estadía en ${data.hotelName} es mañana!`,
    bodyContent,
    actionButton: {
      text: 'Ver Mi Voucher & Detalles',
      url: portalUrl,
    },
    footerNotice: 'Este recordatorio se emite automáticamente 24 horas antes de la fecha programada de llegada.',
  });
}

