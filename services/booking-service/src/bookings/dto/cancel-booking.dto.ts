import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CancelBookingDto {
  @ApiPropertyOptional({
    example: 'Cambio de planes de viaje o motivos de fuerza mayor',
    description: 'Motivo por el cual el cliente o el hotel cancela la reserva',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

