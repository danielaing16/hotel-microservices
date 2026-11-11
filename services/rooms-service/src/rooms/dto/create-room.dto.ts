import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsArray,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoomTypeCategory } from '../../common/enums/room-type.enum';
import { RoomStatus } from '../../common/enums/room-status.enum';

export class CreateRoomDto {
  @ApiProperty({
    example: 'a4b88950-84a8-4c91-9457-41480f779d71',
    description: 'UUID del hotel al que pertenece la habitación',
  })
  @IsString()
  @IsNotEmpty({ message: 'El ID del hotel (hotelId) es obligatorio' })
  hotelId: string;

  @ApiPropertyOptional({
    example: 'cartagena-luxury-beach-spa-resort',
    description: 'Slug del hotel asociado',
  })
  @IsString()
  @IsOptional()
  hotelSlug?: string;

  @ApiPropertyOptional({
    example: 'Cartagena Luxury Beach & Spa Resort',
    description: 'Nombre del hotel asociado',
  })
  @IsString()
  @IsOptional()
  hotelName?: string;

  @ApiProperty({
    example: '304',
    description: 'Número o código físico de la habitación',
  })
  @IsString()
  @IsNotEmpty({ message: 'El número de habitación (roomNumber) es obligatorio' })
  roomNumber: string;

  @ApiPropertyOptional({
    example: 3,
    description: 'Piso donde se ubica la habitación',
    default: 1,
  })
  @IsInt({ message: 'El piso debe ser un número entero' })
  @Min(0)
  @Max(150)
  @IsOptional()
  floor?: number;

  @ApiProperty({
    example: 'Junior Suite Oceanfront con Balcón Privado',
    description: 'Nombre comercial del tipo de habitación',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la habitación es obligatorio' })
  name: string;

  @ApiProperty({
    enum: RoomTypeCategory,
    example: RoomTypeCategory.JUNIOR_SUITE,
    description: 'Categoría del tipo de habitación',
  })
  @IsEnum(RoomTypeCategory, {
    message:
      'El tipo de habitación debe ser uno de: STANDARD, DELUXE, JUNIOR_SUITE, PRESIDENTIAL_SUITE, PENTHOUSE',
  })
  roomType: RoomTypeCategory;

  @ApiProperty({
    example:
      'Espaciosa suite con terraza frente al mar Caribe, cama King de plumas de ganso, sala de estar independiente y baño en mármol.',
    description: 'Descripción detallada de la habitación',
  })
  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  description: string;

  @ApiProperty({
    example: 240.0,
    description: 'Tarifa base por noche en USD',
    minimum: 10,
  })
  @IsNumber({}, { message: 'El precio por noche debe ser un número válido' })
  @Min(1, { message: 'El precio por noche debe ser mayor a 0' })
  pricePerNight: number;

  @ApiPropertyOptional({
    example: 24000,
    description: 'Tarifa base en centavos (si se omite se calcula como pricePerNight * 100)',
  })
  @IsInt()
  @Min(100)
  @IsOptional()
  basePriceCents?: number;

  @ApiPropertyOptional({
    example: 'USD',
    default: 'USD',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'Capacidad máxima de adultos',
    default: 2,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  maxAdults?: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Capacidad máxima de niños',
    default: 1,
  })
  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  maxChildren?: number;

  @ApiPropertyOptional({
    example: '1 Cama King + 1 Sofá Cama',
    description: 'Tipo de camas de la habitación',
  })
  @IsString()
  @IsOptional()
  bedType?: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'Cantidad de camas en la habitación',
    default: 1,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  bedsCount?: number;

  @ApiPropertyOptional({
    example: 58,
    description: 'Área de la habitación en metros cuadrados (m²)',
    default: 32,
  })
  @IsNumber()
  @Min(10)
  @IsOptional()
  sizeSqm?: number;

  @ApiPropertyOptional({
    example: 'Vista al Mar',
    description: 'Tipo de vista desde la habitación',
  })
  @IsString()
  @IsOptional()
  viewType?: string;

  @ApiPropertyOptional({
    example: [
      'Aire Acondicionado',
      'Smart TV 65" 4K',
      'Balcón Privado',
      'Minibar Premium',
      'Cafetera Nespresso',
      'Caja Fuerte Digital',
    ],
    description: 'Amenidades de la habitación',
    type: [String],
  })
  @IsArray({ message: 'Las amenidades deben enviarse como un arreglo de textos' })
  @IsOptional()
  amenities?: string[];

  @ApiPropertyOptional({
    example: [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Galería de fotos de la habitación (URLs)',
    type: [String],
  })
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({
    enum: RoomStatus,
    example: RoomStatus.AVAILABLE,
    default: RoomStatus.AVAILABLE,
  })
  @IsEnum(RoomStatus)
  @IsOptional()
  status?: RoomStatus;

  @ApiPropertyOptional({
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  breakfastIncluded?: boolean;

  @ApiPropertyOptional({
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isSmokingAllowed?: boolean;

  @ApiPropertyOptional({
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

