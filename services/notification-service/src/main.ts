import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('NotificationServiceBootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Habilitar CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Validaciones globales de DTOs con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configuración del Broker de Mensajería RabbitMQ (AMQP Worker)
  const rabbitUrl =
    configService.get<string>('rabbitmq.url') || 'amqp://guest:guest@localhost:5672';
  const rabbitQueue =
    configService.get<string>('rabbitmq.queue') || 'hotel_notifications_queue';

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl],
      queue: rabbitQueue,
      queueOptions: {
        durable: true,
      },
      noAck: true,
    },
  });

  // Documentación Interactiva OpenAPI / Swagger
  const config = new DocumentBuilder()
    .setTitle('📧 Sistema Hotelero - Microservicio de Notificaciones (Notification Service)')
    .setDescription(
      'Documentación OpenAPI del Microservicio de Notificaciones y Emisión de Vouchers PDF. ' +
        'Opera como Worker Asíncrono conectado a RabbitMQ para consumir eventos transaccionales ' +
        '(registro, confirmación de reserva, fallo de pago, recordatorio de check-in 24h y comprobante de reembolso) ' +
        'generando comprobantes en PDF con código QR y despachando correos con Nodemailer sin bloquear el checkout.',
    )
    .setVersion('1.0.0')
    .addTag('Microservicio de Notificaciones & Vouchers PDF (Worker RabbitMQ)')
    .addTag('Monitoreo y Salud (Health Check)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Notification Service API & Worker Docs',
  });

  // Iniciar el consumidor RabbitMQ con tolerancia a reconexión
  try {
    await app.startAllMicroservices();
    logger.log(`🐇 Consumidor RabbitMQ conectado activamente a la cola: '${rabbitQueue}'`);
  } catch (err) {
    logger.warn(
      `⚠️ RabbitMQ no está disponible en este momento (${err.message}). ` +
        `El worker seguirá escuchando peticiones REST y reintentará conexión al broker.`,
    );
  }

  const port = configService.get<number>('port', 3008);
  await app.listen(port);

  logger.log(`🚀 Microservicio Notification Service ejecutándose en: http://localhost:${port}`);
  logger.log(`📖 Documentación Swagger UI disponible en: http://localhost:${port}/api/docs`);
}

bootstrap();

