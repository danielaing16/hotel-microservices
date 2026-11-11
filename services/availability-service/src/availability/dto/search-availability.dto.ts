import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchAvailabilityDto {
  @ApiProperty({
    example: 'cartagena-luxury-beach-spa-resort',
    description: 'UUID o Slug del hotel a consultar',
  })
  @IsString()
  @IsNotEmpty({ message: 'El identificador del hotel (hotelId) es obligatorio' })
  hotelId: string;

  @ApiProperty({
    example: '2026-11-20',
    description: 'Fecha de llegada (Check-in, formato YYYY-MM-DD)',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'checkIn debe tener el formato YYYY-MM-DD' })
  checkIn: string;

  @ApiProperty({
    example: '2026-11-25',
    description: 'Fecha de salida (Check-out, formato YYYY-MM-DD)',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'checkOut debe tener el formato YYYY-MM-DD' })
  checkOut: string;

  @ApiPropertyOptional({
    example: 2,
    default: 1,
    description: 'Cantidad de adultos para calcular capacidad',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  adults?: number = 1;

  @ApiPropertyOptional({
    example: 0,
    default: 0,
    description: 'Cantidad de niños para calcular capacidad',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  children?: number = 0;

  @ApiPropertyOptional({
    example: 'DELUXE',
    description: 'Categoría opcional de habitación a filtrar',
  })
  @IsOptional()
  @IsString()
  roomType?: string;
}

