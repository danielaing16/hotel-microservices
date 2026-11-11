import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('AvailabilityServiceBootstrap');
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

  // Conexión del Microservicio a RabbitMQ (Consumidor de eventos transaccionales)
  const rabbitUrl =
    configService.get<string>('RABBITMQ_URL') || 'amqp://guest:guest@localhost:5672';
  const rabbitQueue =
    configService.get<string>('RABBITMQ_QUEUE') || 'hotel_notifications_queue';

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
    .setTitle('📅 Sistema Hotelero - Microservicio de Disponibilidad (Availability Service)')
    .setDescription(
      'Documentación OpenAPI del motor de búsqueda de disponibilidad en tiempo real, cotización dinámica, ' +
        'bloqueos temporales anti-overbooking (Redis Soft-Locks / Holds de 10 min) y calendario de ocupación por habitación.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description:
          'Ingresa tu token JWT obtenido desde el Gateway o Auth Service',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Availability Service API Docs',
  });

  // Iniciar consumidor de eventos RabbitMQ
  try {
    await app.startAllMicroservices();
    logger.log(`🐇 Consumidor RabbitMQ conectado activamente a la cola: '${rabbitQueue}'`);
  } catch (err) {
    logger.warn(
      `⚠️ RabbitMQ no está disponible en este momento (${err.message}). ` +
        `El servicio seguirá escuchando peticiones REST y reintentará conexión al broker.`,
    );
  }

  const port = process.env.PORT || 3004;
  await app.listen(port);

  logger.log(`🚀 Microservicio Availability Service ejecutándose en: http://localhost:${port}`);
  logger.log(`📖 Documentación Swagger UI disponible en: http://localhost:${port}/api/docs`);
}

bootstrap();

