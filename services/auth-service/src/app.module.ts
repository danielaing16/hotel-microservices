import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const useSsl =
          configService.get<string>('DB_SSL') === 'true' ||
          Boolean(databaseUrl && /sslmode=require|neon\.tech|render\.com|supabase/i.test(databaseUrl));
        return {
          type: 'postgres' as const,
          ...(databaseUrl
            ? { url: databaseUrl }
            : {
                host: configService.get<string>('DB_HOST', 'localhost'),
                port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
                username: configService.get<string>('DB_USERNAME', 'postgres'),
                password: configService.get<string>('DB_PASSWORD', 'postgres123'),
                database: configService.get<string>('DB_DATABASE', 'hotel_auth_db'),
              }),
          ssl: useSsl ? { rejectUnauthorized: false } : false,
          entities: [User],
          autoLoadEntities: true,
          synchronize: true,
          logging: configService.get<string>('NODE_ENV') === 'development',
        };
      },
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
