import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { PaymentStatus } from '../../common/enums/payment-status.enum';

@Entity('payments')
@Index(['userId', 'createdAt'])
@Index(['bookingId', 'status'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 64 })
  bookingId: string;

  @Index()
  @Column({ type: 'varchar', length: 30 })
  bookingCode: string;

  @Index()
  @Column({ type: 'varchar', length: 64 })
  userId: string;

  @Column({ type: 'varchar', length: 150 })
  userEmail: string;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'int' })
  amountCents: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 50, default: 'STRIPE' })
  gatewayProvider: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 120, unique: true })
  transactionReference: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 120, unique: true })
  idempotencyKey: string;

  @Index()
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ type: 'varchar', length: 50, default: 'CREDIT_CARD' })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 4, nullable: true })
  cardLast4: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cardBrand: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  receiptUrl: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

