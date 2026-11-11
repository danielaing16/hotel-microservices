import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { RoomTypeCategory } from '../../common/enums/room-type.enum';
import { RoomStatus } from '../../common/enums/room-status.enum';

@Entity('rooms')
export class Room {
  @ApiProperty({
    example: 'c7f99120-51b2-4e82-9a11-72819f441a01',
    description: 'Identificador único (UUID) de la habitación',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'a4b88950-84a8-4c91-9457-41480f779d71',
    description: 'UUID del hotel al que pertenece la habitación',
  })
  @Column()
  @Index()
  hotelId: string;

  @ApiProperty({
    example: 'cartagena-luxury-beach-spa-resort',
    description: 'Slug del hotel asociado (para cruces rápidos y legibles)',
    required: false,
  })
  @Column({ nullable: true })
  @Index()
  hotelSlug?: string;

  @ApiProperty({
    example: 'Cartagena Luxury Beach & Spa Resort',
    description: 'Nombre comercial del hotel al que pertenece la habitación',
  })
  @Column({ default: 'Hotel Principal' })
  hotelName: string;

  @ApiProperty({
    example: '304',
    description: 'Número o código físico de la habitación en el hotel',
  })
  @Column()
  @Index()
  roomNumber: string;

  @ApiProperty({
    example: 3,
    description: 'Piso o nivel en el que se ubica la habitación',
  })
  @Column({ type: 'int', default: 1 })
  floor: number;

  @ApiProperty({
    example: 'Junior Suite Oceanfront con Balcón Privado',
    description: 'Nombre comercial de la habitación o categoría',
  })
  @Column()
  name: string;

  @ApiProperty({
    enum: RoomTypeCategory,
    example: RoomTypeCategory.JUNIOR_SUITE,
    description: 'Categoría estandarizada del tipo de habitación',
  })
  @Column({
    type: 'varchar',
    length: 40,
    default: RoomTypeCategory.STANDARD,
  })
  @Index()
  roomType: RoomTypeCategory;

  @ApiProperty({
    example:
      'Espaciosa suite con terraza frente al mar Caribe, cama King de plumas de ganso, sala de estar independiente y baño en mármol con tina de hidromasaje.',
    description: 'Descripción detallada de la habitación y sus comodidades',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    example: 240.0,
    description: 'Tarifa base por noche en dólares (USD)',
  })
  @Column({ type: 'float', default: 120.0 })
  @Index()
  pricePerNight: number;

  @ApiProperty({
    example: 24000,
    description: 'Tarifa base por noche expresada en centavos (para cálculos transaccionales exactos)',
  })
  @Column({ type: 'int', default: 12000 })
  basePriceCents: number;

  @ApiProperty({
    example: 'USD',
    description: 'Moneda de la tarifa base',
    default: 'USD',
  })
  @Column({ length: 10, default: 'USD' })
  currency: string;

  @ApiProperty({
    example: 2,
    description: 'Capacidad máxima de huéspedes adultos',
    minimum: 1,
    maximum: 10,
  })
  @Column({ type: 'int', default: 2 })
  maxAdults: number;

  @ApiProperty({
    example: 2,
    description: 'Capacidad máxima de niños permitidos',
    minimum: 0,
    maximum: 8,
  })
  @Column({ type: 'int', default: 1 })
  maxChildren: number;

  @ApiProperty({
    example: '1 Cama King + 1 Sofá Cama',
    description: 'Configuración y tipo de camas disponibles en la habitación',
  })
  @Column({ default: '1 Cama King' })
  bedType: string;

  @ApiProperty({
    example: 2,
    description: 'Cantidad total de camas físicas en la habitación',
  })
  @Column({ type: 'int', default: 1 })
  bedsCount: number;

  @ApiProperty({
    example: 58,
    description: 'Tamaño o superficie de la habitación en metros cuadrados (m²)',
  })
  @Column({ type: 'float', default: 32 })
  sizeSqm: number;

  @ApiProperty({
    example: 'Vista al Mar',
    description: 'Orientación o vista desde la habitación (Mar, Ciudad, Montaña, Jardín, Piscina)',
  })
  @Column({ default: 'Vista Panorámica' })
  viewType: string;

  @ApiProperty({
    example: [
      'Aire Acondicionado',
      'Smart TV 65" 4K',
      'Balcón Privado',
      'Minibar Premium',
      'Cafetera Nespresso',
      'Caja Fuerte Digital',
      'Tina de Hidromasaje',
    ],
    description: 'Amenidades y equipamiento interno de la habitación',
    type: [String],
  })
  @Column('simple-array')
  amenities: string[];

  @ApiProperty({
    example: [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Galería de fotografías de la habitación (URLs)',
    type: [String],
  })
  @Column('simple-array', { nullable: true })
  images: string[];

  @ApiProperty({
    enum: RoomStatus,
    example: RoomStatus.AVAILABLE,
    description: 'Estado operativo actual de la habitación física',
    default: RoomStatus.AVAILABLE,
  })
  @Column({
    type: 'varchar',
    length: 30,
    default: RoomStatus.AVAILABLE,
  })
  @Index()
  status: RoomStatus;

  @ApiProperty({
    example: true,
    description: 'Indica si la tarifa incluye desayuno buffet',
    default: true,
  })
  @Column({ default: true })
  breakfastIncluded: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica si se permite fumar (balcón/terraza habilitada)',
    default: false,
  })
  @Column({ default: false })
  isSmokingAllowed: boolean;

  @ApiProperty({
    example: 'd9b2d63d-a233-4123-847e-8c5e93348123',
    description: 'UUID del administrador (HOTEL_ADMIN) que registró la habitación',
    required: false,
  })
  @Column({ nullable: true })
  adminUserId?: string;

  @ApiProperty({
    example: true,
    description: 'Indica si la habitación está activa en el inventario comercial',
    default: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    example: '2026-11-11T14:00:00.000Z',
    description: 'Fecha de registro en la base de datos',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2026-11-11T14:00:00.000Z',
    description: 'Fecha de última actualización',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}

