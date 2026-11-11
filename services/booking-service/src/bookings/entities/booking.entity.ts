import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { BookingStatus } from '../../common/enums/booking-status.enum';

@Entity('bookings')
@Index(['userId', 'createdAt'])
@Index(['hotelId', 'status'])
@Index(['checkIn', 'checkOut'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 30, unique: true })
  bookingCode: string;

  @Index()
  @Column({ type: 'varchar', length: 64 })
  userId: string;

  @Column({ type: 'varchar', length: 150 })
  userEmail: string;

  @Column({ type: 'varchar', length: 150 })
  userName: string;

  @Index()
  @Column({ type: 'varchar', length: 64 })
  hotelId: string;

  @Column({ type: 'varchar', length: 200 })
  hotelName: string;

  @Index()
  @Column({ type: 'varchar', length: 64 })
  roomId: string;

  @Column({ type: 'varchar', length: 30 })
  roomNumber: string;

  @Column({ type: 'varchar', length: 200 })
  roomName: string;

  @Index()
  @Column({ type: 'date' })
  checkIn: string;

  @Index()
  @Column({ type: 'date' })
  checkOut: string;

  @Column({ type: 'int' })
  nightsCount: number;

  @Column({ type: 'int', default: 1 })
  guestsCount: number;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  holdId: string;

  @Column({ type: 'float' })
  totalAmount: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Index()
  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING_PAYMENT,
  })
  status: BookingStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentId: string;

  @Column({ type: 'text', nullable: true })
  specialRequests: string;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

