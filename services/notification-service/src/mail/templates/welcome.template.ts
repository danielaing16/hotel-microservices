import { renderBaseTemplate } from './base.template';

export interface WelcomeEmailData {
  firstName: string;
  lastName: string;
  email: string;
  loginUrl?: string;
}

export function renderWelcomeEmail(data: WelcomeEmailData): string {
  const loginUrl = data.loginUrl || 'http://localhost';

  const bodyContent = `
    <p style="font-size: 16px; margin-top: 0;">
      ¡Hola, <strong style="color: #4f46e5;">${data.firstName} ${data.lastName}</strong>!
    </p>
    <p>
      Te damos la más cordial bienvenida a <strong>Travel & Resorts</strong>. Tu cuenta ha sido creada exitosamente en nuestra plataforma de reservas hoteleras de última generación.
    </p>

    <!-- Tarjeta de Beneficios -->
    <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 18px; border-radius: 6px; margin: 24px 0;">
      <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">
        ✨ Lo que puedes hacer a partir de ahora:
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px;">
        <li style="margin-bottom: 6px;">Explorar cientos de sedes y destinos exclusivos en tiempo real.</li>
        <li style="margin-bottom: 6px;">Bloquear habitaciones con garantía anti-overbooking impulsada por Redis.</li>
        <li style="margin-bottom: 6px;">Descargar tus vouchers de confirmación con código QR para Fast Check-in.</li>
        <li>Gestionar tus reservas, fechas y políticas flexibles desde tu panel de usuario.</li>
      </ul>
    </div>

    <p style="font-size: 14px; color: #64748b;">
      Tu correo registrado es: <strong style="color: #0f172a;">${data.email}</strong>.
    </p>
    <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">
      Si tienes alguna duda o requieres asistencia personalizada, nuestro equipo de soporte y concierge está disponible las 24 horas del día.
    </p>
  `;

  return renderBaseTemplate({
    preheader: `¡Bienvenido a Travel & Resorts, ${data.firstName}! Tu cuenta ha sido activada con éxito.`,
    title: '🎉 ¡Bienvenido a Travel & Resorts!',
    bodyContent,
    actionButton: {
      text: 'Ir a Explorar Hoteles',
      url: loginUrl,
    },
    footerNotice: 'Has recibido este mensaje porque te registraste en el sistema de reservas Travel & Resorts.',
  });
}

