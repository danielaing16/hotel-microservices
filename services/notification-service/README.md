# 📧 Microservicio de Notificaciones y Vouchers PDF (Notification Service)

Microservicio asíncrono (*Worker / Consumer*) desarrollado con **NestJS**, **RabbitMQ**, **Nodemailer**, **PDFKit** y **QRCode**.

Forma parte del ecosistema de microservicios de reservas hoteleras **Travel & Resorts**, encargado de procesar eventos de mensajería sin impactar los tiempos de respuesta del checkout, generar vouchers oficiales de hospedaje en formato PDF de alta fidelidad con código QR para recepción y despachar correos electrónicos transaccionales.

---

## 🎯 Responsabilidades Principales

1. **Consumo Asíncrono de Eventos RabbitMQ:**
   - Consume eventos publicados por `Auth Service`, `Bookings Service` y `Payments Service` a través de la cola `hotel_notifications_queue`.
   - Garantiza desacoplamiento total y alta disponibilidad evitando retardos en los flujos críticos de checkout.

2. **Generación de Vouchers Oficiales en PDF (PDFKit + QRCode):**
   - Emite vouchers de confirmación con diseño elegante y corporativo (*A4 Luxury Layout*).
   - Genera dinámicamente un código QR de alta resolución con carga útil JSON para escaneo y *Fast Check-in* en recepción.
   - Detalla titular, fechas de estadía, noches, tipo de habitación, desglose de impuestos y políticas de check-in / check-out.

3. **Despacho de Correos Electrónicos Transaccionales (Nodemailer):**
   - **Bienvenida (`user.registered`):** Correo de activación de cuenta con credenciales y accesos.
   - **Confirmación de Reserva (`booking.confirmed` / `payment.succeeded`):** Resumen de reserva con el archivo **Voucher PDF adjunto**.
   - **Fallo de Pago (`payment.failed`):** Alerta transaccional con aviso de expiración del candado en Redis y enlace de reintento.
   - **Recordatorio de Check-in (`booking.checkin.reminder`):** Notificación 24 horas antes de la llegada con horario de entrada y recomendaciones.
   - **Comprobante de Reembolso (`booking.cancelled` / `payment.refunded`):** Constancia de acreditación financiera tras cancelación de estadía.

---

## 📐 Arquitectura del Servicio

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   Auth Service  │       │  Booking Service│       │ Payment Service │
└────────┬────────┘       └────────┬────────┘       └────────┬────────┘
         │                         │                         │
         │  user.registered        │  booking.confirmed      │  payment.failed / refunded
         └─────────────────────────┼─────────────────────────┘
                                   │
                                   ▼
                         ╔═══════════════════╗
                         ║ RabbitMQ Broker   ║
                         ║  (Exchange/Queue) ║
                         ╚═════════╦═════════╝
                                   │ Eventos AMQP
                                   ▼
               ╔═══════════════════════════════════════╗
               ║  NOTIFICATIONS SERVICE (Worker 3008)  ║
               ╠═══════════════════════════════════════╣
               ║  • EventPattern Handlers              ║
               ║  • PDFKit + QRCode Voucher Engine     ║
               ║  • Nodemailer HTML Templates Engine   ║
               ║  • In-Memory Audit Log (Last 50)      ║
               ║  • OpenAPI / Swagger Documentation    ║
               ╚═══════════════════╦═══════════════════╝
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
         📄 Voucher PDF (QR)            ✉️ Email Transaccional
         (Descarga / Adjunto)           (Mailtrap / SendGrid / Ethereal)
```

---

## 🛠️ Tecnologías Utilizadas

- **Framework:** Node.js v20+ / [NestJS 10](https://nestjs.com/)
- **Microservices Transport:** `@nestjs/microservices`, `amqplib`, `amqp-connection-manager`
- **Generación de Documentos:** `pdfkit`
- **Códigos QR:** `qrcode`
- **Envío de Correos:** `nodemailer` (Soporta Mailtrap, SendGrid, Gmail SMTP y Ethereal de prueba)
- **Documentación API:** `@nestjs/swagger` (Swagger UI en `/api/docs`)
- **Validación:** `class-validator`, `class-transformer`

---

## ⚙️ Variables de Entorno

| Variable | Valor por Defecto | Descripción |
|---|---|---|
| `PORT` | `3008` | Puerto de escucha HTTP para Swagger y REST |
| `NODE_ENV` | `development` | Entorno de ejecución (`development` / `production`) |
| `RABBITMQ_URL` | `amqp://guest:guest@rabbitmq:5672` | Cadena de conexión al broker AMQP RabbitMQ |
| `RABBITMQ_QUEUE` | `hotel_notifications_queue` | Nombre de la cola de eventos de notificación |
| `SMTP_HOST` | `smtp.mailtrap.io` | Servidor SMTP para despacho de correos |
| `SMTP_PORT` | `2525` | Puerto del servidor SMTP |
| `SMTP_USER` | *(vacío)* | Usuario SMTP (Mailtrap/SendGrid) |
| `SMTP_PASS` | *(vacío)* | Contraseña SMTP |
| `SMTP_SECURE` | `false` | Conexión SSL/TLS |
| `SMTP_FROM` | `reservas@travel-resorts.com` | Remitente visible de los correos |

> **Nota para desarrollo local:** Si no configuras credenciales SMTP en `.env`, el servicio iniciará automáticamente una cuenta de prueba gratuita en **Ethereal Email** e imprimirá en consola un enlace directo (`https://ethereal.email/message/...`) para previsualizar cada correo en el navegador.

---

## 🚀 Endpoints REST y Documentación

- **Documentación Swagger UI:** [http://localhost:3008/api/docs](http://localhost:3008/api/docs)
- **Health Check:** `GET /health`
- **Estado del Broker:** `GET /api/notifications/status`
- **Descargar Voucher PDF de Muestra:** `GET /api/notifications/voucher/sample`
- **Generar Voucher Personalizado:** `POST /api/notifications/voucher/preview`
- **Historial de Notificaciones:** `GET /api/notifications/history`
- **Disparador Universal de Pruebas:** `POST /api/notifications/test-event`

