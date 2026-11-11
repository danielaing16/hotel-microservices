import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { Payment } from './entities/payment.entity';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { QueryPaymentsDto } from './dto/query-payments.dto';
import { RequestUser } from '../common/decorators/current-user.decorator';
import { INITIAL_PAYMENT_SEED } from './seed/payment.seed';

@Injectable()
export class PaymentService implements OnModuleInit {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly configService: ConfigService,
    @Inject('RABBITMQ_PAYMENT_CLIENT')
    private readonly rabbitClient: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      const count = await this.paymentRepository.count();
      if (count === 0) {
        this.logger.log('Inicializando registros de pagos con datos semilla...');
        await this.seed();
      }
    } catch (err) {
      this.logger.warn(`No se pudo verificar o sembrar pagos iniciales: ${err.message}`);
    }
  }

  /**
   * Valida sintaxis UUID para PostgreSQL
   */
  private isUuid(val: string): boolean {
    return typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
  }

  /**
   * Genera referencia única de transacción Stripe / Sandbox
   */
  private generateTxRef(): string {
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    return `tx_stripe_${Date.now()}_${randomSuffix}`;
  }

  /**
   * Procesa el cobro transaccional con control de idempotencia y emisión de eventos RabbitMQ
   */
  async processPayment(dto: ProcessPaymentDto, user: RequestUser) {
    // 1. Verificación de Idempotencia: si la llave ya fue procesada, retornar el pago existente
    const existing = await this.paymentRepository.findOne({
      where: { idempotencyKey: dto.idempotencyKey },
    });
    if (existing) {
      this.logger.log(`⚡ Idempotencia activada: Transacción duplicada prevenida (${dto.idempotencyKey})`);
      return {
        message: 'Transacción ya procesada previamente (Idempotencia verificada)',
        isDuplicate: true,
        payment: existing,
      };
    }

    // 2. Consultar y validar la reserva en booking-service
    const bookingsUrl = this.configService.get<string>(
      'BOOKINGS_SERVICE_URL',
      'http://booking-service:3005',
    );

    let booking: any = null;
    try {
      const res = await fetch(`${bookingsUrl}/api/bookings/${dto.bookingId}`, {
        headers: {
          'x-user-id': user.id,
          'x-user-email': user.email,
          'x-user-role': user.role,
        },
        signal: AbortSignal.timeout(3500),
      });

      if (res.status === 404) {
        throw new NotFoundException(`La reserva '${dto.bookingId}' no existe en el sistema`);
      }
      if (res.ok) {
        booking = await res.json();
      }
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      this.logger.warn(`Error al consultar booking-service: ${err.message}`);
    }

    if (!booking) {
      throw new NotFoundException(`No fue posible validar la reserva '${dto.bookingId}'`);
    }

    if (booking.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException(
        `La reserva se encuentra en estado '${booking.status}'. Solo es posible pagar reservas pendientes ('PENDING_PAYMENT').`,
      );
    }

    // 3. Validar coincidencia de monto
    const expectedAmount = Number(booking.totalAmount);
    if (Math.abs(expectedAmount - dto.amount) > 0.05) {
      throw new BadRequestException(
        `Monto inconsistente: El total de la reserva es ${expectedAmount} ${booking.currency}, pero se envió ${dto.amount}`,
      );
    }

    // 4. Detección de tarjeta de prueba declinada (Simulación bancaria)
    const cardNum = (dto.cardNumber || '4242424242424242').replace(/\s+/g, '');
    if (cardNum.endsWith('0002')) {
      const failedTxRef = this.generateTxRef();
      const failedPayment = this.paymentRepository.create({
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        userId: user.id,
        userEmail: user.email,
        amount: dto.amount,
        amountCents: Math.round(dto.amount * 100),
        currency: dto.currency || 'USD',
        gatewayProvider: 'STRIPE_SANDBOX',
        transactionReference: failedTxRef,
        idempotencyKey: dto.idempotencyKey,
        status: PaymentStatus.FAILED,
        paymentMethod: dto.paymentMethod || 'CREDIT_CARD',
        cardLast4: cardNum.slice(-4),
        cardBrand: 'Visa',
        errorMessage: 'Tarjeta declinada por fondos insuficientes o rechazo de emisor',
      });
      await this.paymentRepository.save(failedPayment);

      // Emitir evento RabbitMQ: payment.failed
      this.rabbitClient.emit('payment.failed', {
        paymentId: failedPayment.id,
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        reason: 'Fondos insuficientes (Tarjeta de prueba 0002)',
      });

      throw new ConflictException(
        'Pago rechazado por el banco emisor: Tarjeta declinada o fondos insuficientes.',
      );
    }

    // 5. Transacción aprobada: Persistir el pago
    const txRef = this.generateTxRef();
    const cardLast4 = cardNum.slice(-4);
    const cardBrand = cardNum.startsWith('5') ? 'Mastercard' : 'Visa';
    const receiptUrl = `https://pay.travel-resorts.com/receipts/${txRef}`;

    const payment = this.paymentRepository.create({
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      userId: user.id,
      userEmail: user.email,
      amount: dto.amount,
      amountCents: Math.round(dto.amount * 100),
      currency: dto.currency || 'USD',
      gatewayProvider: 'STRIPE_SANDBOX',
      transactionReference: txRef,
      idempotencyKey: dto.idempotencyKey,
      status: PaymentStatus.SUCCEEDED,
      paymentMethod: dto.paymentMethod || 'CREDIT_CARD',
      cardLast4,
      cardBrand,
      receiptUrl,
      errorMessage: null,
    });

    const saved = await this.paymentRepository.save(payment);
    this.logger.log(`💳 Pago exitoso registrado: ${saved.transactionReference} ($${saved.amount} ${saved.currency})`);

    // 6. Publicar evento en RabbitMQ: payment.succeeded
    // Esto confirma automáticamente la reserva en booking-service, confirma el inventario en availability-service
    // y dispara el correo de confirmación con voucher PDF en notification-service
    try {
      this.rabbitClient.emit('payment.succeeded', {
        paymentId: saved.id,
        bookingId: saved.bookingId,
        bookingCode: saved.bookingCode,
        holdId: booking.holdId,
        amount: saved.amount,
        currency: saved.currency,
        userId: saved.userId,
        userEmail: saved.userEmail,
        transactionReference: saved.transactionReference,
        cardLast4: saved.cardLast4,
        cardBrand: saved.cardBrand,
        receiptUrl: saved.receiptUrl,
        paidAt: saved.createdAt,
      });
      this.logger.log(`🐇 Evento 'payment.succeeded' emitido para reserva ${saved.bookingCode}`);
    } catch (err) {
      this.logger.warn(`No se pudo emitir evento payment.succeeded a RabbitMQ: ${err.message}`);
    }

    return {
      message: '¡Pago acreditado exitosamente! Tu reserva ha sido confirmada.',
      payment: saved,
      receipt: {
        transactionReference: saved.transactionReference,
        amount: saved.amount,
        currency: saved.currency,
        paymentMethod: `${saved.cardBrand} terminada en ${saved.cardLast4}`,
        receiptUrl: saved.receiptUrl,
        timestamp: saved.createdAt,
      },
    };
  }

  /**
   * Obtiene el listado de transacciones del usuario en sesión
   */
  async findMyPayments(userId: string) {
    return await this.paymentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtiene el comprobante de una transacción por ID o referencia
   */
  async findOne(idOrRef: string, user?: RequestUser) {
    const isUuid = this.isUuid(idOrRef);
    const payment = isUuid
      ? await this.paymentRepository.findOne({
          where: [{ id: idOrRef }, { transactionReference: idOrRef }],
        })
      : await this.paymentRepository.findOne({
          where: { transactionReference: idOrRef },
        });

    if (!payment) {
      throw new NotFoundException(`Transacción '${idOrRef}' no encontrada`);
    }

    if (user && user.role === 'GUEST' && payment.userId !== user.id) {
      throw new ForbiddenException('No tienes permiso para consultar esta transacción');
    }

    return payment;
  }

  /**
   * Listado general de transacciones financieras para administración
   */
  async findAll(query: QueryPaymentsDto) {
    const qb = this.paymentRepository.createQueryBuilder('p');

    if (query.status) {
      qb.andWhere('p.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        '(p.transactionReference ILIKE :search OR p.bookingCode ILIKE :search OR p.userEmail ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    qb.orderBy('p.createdAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Ejecuta un reembolso total de una transacción (Reversión financiera)
   */
  async refundPayment(idOrRef: string, reason?: string, user?: RequestUser) {
    const payment = await this.findOne(idOrRef, user);

    if (payment.status === PaymentStatus.REFUNDED) {
      throw new BadRequestException('Esta transacción ya fue reembolsada con anterioridad');
    }

    if (payment.status !== PaymentStatus.SUCCEEDED) {
      throw new BadRequestException(
        `Solo es posible reembolsar pagos en estado SUCCEEDED. Estado actual: '${payment.status}'`,
      );
    }

    payment.status = PaymentStatus.REFUNDED;
    payment.errorMessage = reason || 'Reembolso autorizado por administración';
    const updated = await this.paymentRepository.save(payment);

    // Emitir evento RabbitMQ: payment.refunded
    try {
      this.rabbitClient.emit('payment.refunded', {
        paymentId: updated.id,
        bookingId: updated.bookingId,
        bookingCode: updated.bookingCode,
        amount: updated.amount,
        currency: updated.currency,
        userId: updated.userId,
        reason: updated.errorMessage,
      });
      this.logger.log(`🐇 Evento 'payment.refunded' emitido para ${updated.transactionReference}`);
    } catch (err) {
      this.logger.warn(`No se pudo emitir payment.refunded: ${err.message}`);
    }

    return {
      message: `Reembolso de $${updated.amount} ${updated.currency} procesado correctamente.`,
      payment: updated,
    };
  }

  /**
   * Siembra inicial de pagos
   */
  async seed() {
    for (const item of INITIAL_PAYMENT_SEED) {
      const exists = await this.paymentRepository.findOne({
        where: { transactionReference: item.transactionReference },
      });
      if (!exists) {
        const p = this.paymentRepository.create(item);
        await this.paymentRepository.save(p);
      }
    }
    this.logger.log(`🌱 Semilla de pagos inicializada correctamente (${INITIAL_PAYMENT_SEED.length} registros)`);
  }
}

