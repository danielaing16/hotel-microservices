import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ReservationStatus } from '../../common/enums/reservation-status.enum';

@Entity('room_reservations')
@Index(['roomId', 'checkIn', 'checkOut'])
export class RoomReservation {
  @ApiProperty({
    example: 'd8c11e40-9a22-4e89-8d54-1b709f114c01',
    description: 'Identificador único del registro de disponibilidad/reserva',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'hold_9b2d63d_a233',
    description: 'Identificador del bloqueo temporal en Redis',
  })
  @Column({ unique: true })
  @Index()
  holdId: string;

  @ApiProperty({
    example: 'c7f99120-51b2-4e82-9a11-72819f441a01',
    description: 'UUID de la habitación bloqueada o reservada',
  })
  @Column()
  @Index()
  roomId: string;

  @ApiProperty({
    example: '304',
    description: 'Número físico de la habitación',
    required: false,
  })
  @Column({ nullable: true })
  roomNumber?: string;

  @ApiProperty({
    example: 'a4b88950-84a8-4c91-9457-41480f779d71',
    description: 'UUID del hotel al que pertenece la habitación',
  })
  @Column()
  @Index()
  hotelId: string;

  @ApiProperty({
    example: 'eaa3317e-1365-4367-9346-4cf628e62162',
    description: 'UUID del usuario que inició el hold o reserva',
  })
  @Column()
  @Index()
  userId: string;

  @ApiProperty({
    example: '2026-11-20',
    description: 'Fecha de ingreso (Check-in, formato YYYY-MM-DD)',
  })
  @Column({ type: 'date' })
  @Index()
  checkIn: string;

  @ApiProperty({
    example: '2026-11-25',
    description: 'Fecha de salida (Check-out, formato YYYY-MM-DD)',
  })
  @Column({ type: 'date' })
  @Index()
  checkOut: string;

  @ApiProperty({
    enum: ReservationStatus,
    example: ReservationStatus.HOLD,
    description: 'Estado del bloqueo o reserva (HOLD, CONFIRMED, CANCELLED, RELEASED)',
    default: ReservationStatus.HOLD,
  })
  @Column({
    type: 'varchar',
    length: 30,
    default: ReservationStatus.HOLD,
  })
  @Index()
  status: ReservationStatus;

  @ApiProperty({
    example: 950.0,
    description: 'Monto total cotizado para la estancia',
    required: false,
  })
  @Column({ type: 'float', nullable: true })
  totalAmount?: number;

  @ApiProperty({
    example: 'USD',
    default: 'USD',
  })
  @Column({ length: 10, default: 'USD' })
  currency: string;

  @ApiProperty({
    example: 2,
    default: 1,
  })
  @Column({ type: 'int', default: 1 })
  guestsCount: number;

  @ApiProperty({
    example: 'TR-2026-X8F9Q',
    description: 'Código de referencia oficial generado al confirmar la reserva',
    required: false,
  })
  @Column({ nullable: true })
  @Index()
  bookingReference?: string;

  @ApiProperty({
    example: '2026-11-11T14:40:00.000Z',
    description: 'Momento exacto en el que expira el bloqueo temporal (HOLD) si no se confirma',
  })
  @Column({ type: 'timestamp with time zone', nullable: true })
  expiresAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

