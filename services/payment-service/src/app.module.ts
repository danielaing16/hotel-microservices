import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PaymentModule } from './payments/payment.module';
import { Payment } from './payments/entities/payment.entity';
import { AuthHeaderMiddleware } from './common/middleware/auth-header.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'payment-db'),
        port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres123'),
        database: config.get<string>('DB_DATABASE', 'hotel_payment_db'),
        entities: [Payment],
        synchronize: true, // Auto-creación de tablas en entorno de desarrollo
        logging: false,
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(
          'JWT_SECRET',
          'super_secret_jwt_key_hotel_2026_dev',
        ),
      }),
    }),
    PaymentModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthHeaderMiddleware).forRoutes('*');
  }
}

