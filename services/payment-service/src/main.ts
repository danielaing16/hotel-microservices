import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('PaymentServiceBootstrap');
  const port = process.env.PORT || 3006;

  const app = await NestFactory.create(AppModule);

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

  // Documentación Swagger OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Payment Service API')
    .setDescription(
      'Microservicio Financiero de Pagos: Checkout con idempotencia, transacciones Sandbox/Stripe, reembolsos y eventos EDA.',
    )
    .setVersion('1.0.0')
    .addTag('Pagos (Payment Service)')
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
  logger.log(`🚀 Microservicio Payment Service ejecutándose en: http://localhost:${port}`);
  logger.log(`📖 Documentación Swagger UI disponible en: http://localhost:${port}/api/docs`);
}

bootstrap();

