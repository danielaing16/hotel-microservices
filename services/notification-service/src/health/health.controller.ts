import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@ApiTags('Monitoreo y Salud (Health Check)')
@Controller('health')
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check del microservicio de notificaciones',
    description: 'Retorna el estado del contenedor, modo worker y cola RabbitMQ configurada.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Servicio saludable y en ejecución',
  })
  check() {
    return {
      status: 'UP',
      service: 'hotel-notification-service',
      mode: 'Worker / Consumidor Asíncrono RabbitMQ (Stateless)',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      rabbitmq: {
        queue: this.configService.get<string>('rabbitmq.queue', 'hotel_notifications_queue'),
        urlConfigured: !!this.configService.get<string>('rabbitmq.url'),
      },
      smtp: {
        host: this.configService.get<string>('smtp.host'),
        hasCredentials: !!this.configService.get<string>('smtp.user'),
      },
    };
  }
}

