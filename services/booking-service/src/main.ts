import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('BookingServiceBootstrap');
  const port = process.env.PORT || 3005;

  const app = await NestFactory.create(AppModule);

  // 1. Configuración de RabbitMQ Microservice Consumer
  const rabbitMqUrl =
    process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
  const rabbitQueue =
    process.env.RABBITMQ_QUEUE || 'hotel_notifications_queue';

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitMqUrl],
      queue: rabbitQueue,
      queueOptions: {
        durable: true,
      },
      noAck: true,
    },
  });

  await app.startAllMicroservices();
  logger.log(`🐇 Consumidor RabbitMQ conectado a cola: '${rabbitQueue}'`);

  // 2. CORS y Filtros Globales
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 3. Documentación Swagger OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Booking Service API')
    .setDescription(
      'Microservicio de Reservas: Orquestación del ciclo de vida, check-in/out, bloqueo de habitaciones y eventos RabbitMQ.',
    )
    .setVersion('1.0.0')
    .addTag('Reservas (Booking Service)')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingresa tu JWT de autenticación',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  logger.log(`🚀 Microservicio Booking Service ejecutándose en: http://localhost:${port}`);
  logger.log(`📖 Documentación Swagger UI disponible en: http://localhost:${port}/api/docs`);
}

bootstrap();

