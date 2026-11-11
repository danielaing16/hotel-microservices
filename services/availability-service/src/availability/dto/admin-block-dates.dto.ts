import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminBlockDatesDto {
  @ApiProperty({
    example: 'c7f99120-51b2-4e82-9a11-72819f441a01',
    description: 'UUID de la habitación',
  })
  @IsString()
  @IsNotEmpty({ message: 'El roomId es obligatorio' })
  roomId: string;

  @ApiPropertyOptional({
    example: 'a4b88950-84a8-4c91-9457-41480f779d71',
    description: 'UUID del hotel al que pertenece la habitación',
  })
  @IsOptional()
  @IsString()
  hotelId?: string;

  @ApiProperty({
    example: '2026-11-20',
    description: 'Fecha inicio del bloqueo (Check-in, YYYY-MM-DD)',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'checkIn debe tener formato YYYY-MM-DD' })
  checkIn: string;

  @ApiProperty({
    example: '2026-11-25',
    description: 'Fecha fin del bloqueo (Check-out, YYYY-MM-DD)',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'checkOut debe tener formato YYYY-MM-DD' })
  checkOut: string;

  @ApiPropertyOptional({
    example: 'Mantenimiento preventivo o remodelación',
    description: 'Motivo del bloqueo administrativo',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

