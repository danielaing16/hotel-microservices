import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    example: '89b0dfcf-b975-4694-97f5-fcd3ef7ca4c1',
    description: 'UUID de la habitación seleccionada',
  })
  @IsString()
  @IsNotEmpty({ message: 'El roomId es obligatorio' })
  roomId: string;

  @ApiProperty({
    example: '1293ac0e-852a-45a2-bb6e-efb21bd664bd',
    description: 'UUID o identificador del hotel',
  })
  @IsString()
  @IsNotEmpty({ message: 'El hotelId es obligatorio' })
  hotelId: string;

  @ApiProperty({
    example: '2026-12-01',
    description: 'Fecha de llegada (Check-In YYYY-MM-DD)',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'checkIn debe tener formato YYYY-MM-DD' })
  checkIn: string;

  @ApiProperty({
    example: '2026-12-05',
    description: 'Fecha de salida (Check-Out YYYY-MM-DD)',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'checkOut debe tener formato YYYY-MM-DD' })
  checkOut: string;

  @ApiPropertyOptional({
    example: 2,
    default: 1,
    description: 'Cantidad de personas / huéspedes',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guestsCount?: number = 1;

  @ApiPropertyOptional({
    example: 'hold_uvivik_mwcj09ty',
    description: 'ID de bloqueo temporal previo adquirido en Availability Service (opcional)',
  })
  @IsOptional()
  @IsString()
  holdId?: string;

  @ApiPropertyOptional({
    example: 'Piso alto, cama doble, llegada tarde 8:00 PM',
    description: 'Peticiones o notas especiales para el hotel',
  })
  @IsOptional()
  @IsString()
  specialRequests?: string;
}

