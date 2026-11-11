import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { RoomsModule } from './rooms/rooms.module';
import { Room } from './rooms/entities/room.entity';
import { AuthHeaderMiddleware } from './common/middleware/auth-header.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(
          'JWT_SECRET',
          'super_secret_jwt_key_hotel_2026_dev',
        ),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: parseInt(configService.get<string>('DB_PORT', '5434'), 10),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres123'),
        database: configService.get<string>('DB_DATABASE', 'hotel_rooms_db'),
        entities: [Room],
        autoLoadEntities: true,
        synchronize: true,
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
    RoomsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthHeaderMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

