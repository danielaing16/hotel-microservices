export default () => ({
  port: parseInt(process.env.PORT, 10) || 3008,
  nodeEnv: process.env.NODE_ENV || 'development',
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    queue: process.env.RABBITMQ_QUEUE || 'hotel_notifications_queue',
  },
  smtp: {
    service: process.env.SMTP_SERVICE || (process.env.SMTP_HOST?.includes('gmail') ? 'gmail' : ''),
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 465,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465' || !process.env.SMTP_PORT,
    // Gmail rechaza envíos cuyo remitente no coincide con la cuenta autenticada,
    // por lo que el default debe derivar de SMTP_USER.
    from:
      process.env.SMTP_FROM ||
      (process.env.SMTP_USER
        ? `Travel & Resorts <${process.env.SMTP_USER}>`
        : 'Travel & Resorts <reservas@travel-resorts.com>'),
  },
  urls: {
    frontend: process.env.FRONTEND_URL || 'http://localhost',
    gateway: process.env.API_GATEWAY_URL || 'http://localhost:3000',
  },
});

