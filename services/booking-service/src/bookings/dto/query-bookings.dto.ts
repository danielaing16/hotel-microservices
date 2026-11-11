import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '../../common/enums/booking-status.enum';

export class QueryBookingsDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de hotel',
  })
  @IsOptional()
  @IsString()
  hotelId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado de la reserva',
    enum: BookingStatus,
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({
    description: 'Buscar por código de reserva, nombre de cliente o email',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    default: 1,
    description: 'Número de página',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    default: 20,
    description: 'Límite de elementos por página',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

