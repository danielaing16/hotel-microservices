import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Matches, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HoldRoomDto {
  @ApiProperty({
    example: 'c7f99120-51b2-4e82-9a11-72819f441a01',
    description: 'UUID de la habitación a bloquear temporalmente',
  })
  @IsString()
  @IsNotEmpty({ message: 'El roomId es obligatorio' })
  roomId: string;

  @ApiProperty({
    example: '2026-11-20',
    description: 'Fecha de ingreso (Check-in, formato YYYY-MM-DD)',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'checkIn debe tener formato YYYY-MM-DD' })
  checkIn: string;

  @ApiProperty({
    example: '2026-11-25',
    description: 'Fecha de salida (Check-out, formato YYYY-MM-DD)',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'checkOut debe tener formato YYYY-MM-DD' })
  checkOut: string;

  @ApiPropertyOptional({
    example: 2,
    default: 1,
    description: 'Total de huéspedes',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guestsCount?: number = 1;

  @ApiPropertyOptional({
    example: 600,
    default: 600,
    description: 'Tiempo de vida del bloqueo en segundos (TTL en Redis, máx. 1800s / 30 min)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(60)
  @Max(1800)
  ttlSeconds?: number = 600;
}

