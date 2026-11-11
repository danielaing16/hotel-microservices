import { IsOptional, IsString, IsInt, Min, Max, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RoomTypeCategory } from '../../common/enums/room-type.enum';
import { RoomStatus } from '../../common/enums/room-status.enum';

export class RoomQueryDto {
  @ApiPropertyOptional({
    description: 'Búsqueda por nombre, número de habitación, hotel o descripción',
    example: 'Suite',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por UUID o slug del hotel',
    example: 'a4b88950-84a8-4c91-9457-41480f779d71',
  })
  @IsOptional()
  @IsString()
  hotelId?: string;

  @ApiPropertyOptional({
    enum: RoomTypeCategory,
    description: 'Filtrar por categoría de tipo de habitación',
    example: RoomTypeCategory.JUNIOR_SUITE,
  })
  @IsOptional()
  @IsEnum(RoomTypeCategory)
  roomType?: RoomTypeCategory;

  @ApiPropertyOptional({
    enum: RoomStatus,
    description: 'Filtrar por estado operativo (AVAILABLE, OCCUPIED, MAINTENANCE, INACTIVE)',
    example: RoomStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;

  @ApiPropertyOptional({
    description: 'Tarifa mínima por noche en USD',
    example: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Tarifa máxima por noche en USD',
    example: 500,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Capacidad mínima requerida de adultos',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minAdults?: number;

  @ApiPropertyOptional({
    description: 'Capacidad mínima requerida de niños',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minChildren?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por piso específico',
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  floor?: number;

  @ApiPropertyOptional({
    description: 'Filtrar habitaciones con desayuno incluido',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === '1')
  @IsBoolean()
  breakfastIncluded?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por estado activo (por defecto true)',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === '1')
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Número de página para paginación',
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de habitaciones por página',
    default: 24,
    example: 24,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 24;
}

