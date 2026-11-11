import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RefundPaymentDto {
  @ApiPropertyOptional({
    example: 'Reserva cancelada por fuerza mayor antes de las 48 horas',
    description: 'Motivo del reembolso',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

