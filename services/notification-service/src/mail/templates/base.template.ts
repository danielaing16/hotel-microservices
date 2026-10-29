export interface BaseTemplateOptions {
  preheader: string;
  title: string;
  bodyContent: string;
  footerNotice?: string;
  actionButton?: {
    text: string;
    url: string;
  };
}

export function renderBaseTemplate(options: BaseTemplateOptions): string {
  const actionButtonHtml = options.actionButton
    ? `
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 28px auto 20px auto;">
        <tr>
          <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);">
            <a href="${options.actionButton.url}" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; letter-spacing: 0.3px;">
              ${options.actionButton.text} &rarr;
            </a>
          </td>
        </tr>
      </table>
    `
    : '';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0f19;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #334155;
      -webkit-font-smoothing: antialiased;
    }
    table { border-collapse: collapse; }
    img { border: 0; outline: none; text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .container-table { width: 100% !important; }
      .content-padding { padding: 24px 18px !important; }
      .col-stack { display: block !important; width: 100% !important; margin-bottom: 12px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19;">
  <!-- Preheader Oculto para Bandejas de Entrada -->
  <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #0b0f19;">
    ${options.preheader}
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0f19; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Contenedor Principal (Tarjeta Glassmorphism) -->
        <table class="container-table" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);">
          
          <!-- Encabezado de Marca -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 30px 36px; text-align: left; border-bottom: 3px solid #d97706;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <span style="font-size: 24px; vertical-align: middle;">✈️</span>
                    <span style="font-size: 20px; font-weight: 800; color: #fbbf24; letter-spacing: 1px; margin-left: 8px; vertical-align: middle;">TRAVEL & RESORTS</span>
                    <div style="color: #94a3b8; font-size: 11px; margin-top: 4px; letter-spacing: 0.5px;">SISTEMA GLOBAL DE HOSPEDAJE &bull; NOTIFICACIÓN TRANSACCIONAL</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Título de la Notificación -->
          <tr>
            <td style="background-color: #f8fafc; padding: 18px 36px; border-bottom: 1px solid #e2e8f0;">
              <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #1e293b;">
                ${options.title}
              </h2>
            </td>
          </tr>

          <!-- Cuerpo Principal -->
          <tr>
            <td class="content-padding" style="padding: 32px 36px; line-height: 1.6; font-size: 15px; color: #334155;">
              ${options.bodyContent}
              ${actionButtonHtml}
            </td>
          </tr>

          <!-- Pie del Correo -->
          <tr>
            <td style="background-color: #0f172a; padding: 26px 36px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.5; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 8px 0; color: #cbd5e1; font-weight: 600;">
                Travel & Resorts Cloud Ecosystem &bull; Microservicio de Notificaciones
              </p>
              <p style="margin: 0 0 12px 0;">
                ${options.footerNotice || 'Este correo ha sido generado automáticamente de forma asíncrona mediante el broker RabbitMQ.'}
              </p>
              <div style="font-size: 11px; color: #64748b;">
                &copy; ${new Date().getFullYear()} Travel & Resorts Inc. Todos los derechos reservados.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

