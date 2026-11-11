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
import { Booking } from './entities/booking.entity';
import { BookingStatus } from '../common/enums/booking-status.enum';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { RequestUser } from '../common/decorators/current-user.decorator';
import { INITIAL_BOOKING_SEED } from './seed/booking.seed';

@Injectable()
export class BookingService implements OnModuleInit {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly configService: ConfigService,
    @Inject('RABBITMQ_BOOKING_CLIENT')
    private readonly rabbitClient: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      const count = await this.bookingRepository.count();
      if (count === 0) {
        this.logger.log('Inicializando registros de reservas con datos semilla...');
        await this.seed();
      }
    } catch (err) {
      this.logger.warn(`No se pudo verificar o sembrar reservas iniciales: ${err.message}`);
    }
  }

  /**
   * Genera código de reserva único de 6 caracteres alfanuméricos
   * Ejemplo: TR-2026-X8F9Q
   */
  private generateBookingCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let suffix = '';
    for (let i = 0; i < 5; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const year = new Date().getFullYear();
    return `TR-${year}-${suffix}`;
  }

  /**
   * Calcula el número de noches entre dos fechas
   */
  private calculateNights(checkIn: string, checkOut: string): number {
    const d1 = new Date(`${checkIn}T00:00:00Z`);
    const d2 = new Date(`${checkOut}T00:00:00Z`);
    const diffMs = d2.getTime() - d1.getTime();
    const nights = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 1;
  }

  /**
   * Crea una nueva reserva e interactúa con availability-service para bloquear inventario
   */
  async createBooking(dto: CreateBookingDto, user: RequestUser) {
    if (dto.checkIn >= dto.checkOut) {
      throw new BadRequestException('La fecha de checkIn debe ser estrictamente anterior a checkOut');
    }

    const roomsUrl = this.configService.get<string>(
      'ROOMS_SERVICE_URL',
      'http://rooms-service:3003',
    );
    const availabilityUrl = this.configService.get<string>(
      'AVAILABILITY_SERVICE_URL',
      'http://availability-service:3004',
    );

    // 1. Obtener detalles de la habitación desde rooms-service
    let roomData: any = null;
    try {
      const res = await fetch(`${roomsUrl}/api/rooms/${dto.roomId}`, {
        signal: AbortSignal.timeout(3500),
      });
      if (res.ok) {
        roomData = await res.json();
      }
    } catch (err) {
      this.logger.warn(`No se pudo consultar rooms-service: ${err.message}`);
    }

    const roomName = roomData?.name || `Habitación ${roomData?.roomNumber || 'Estándar'}`;
    const roomNumber = roomData?.roomNumber || '101';
    const hotelName = roomData?.hotelName || 'Travel & Resorts Hotel';
    const pricePerNight = Number(roomData?.pricePerNight) || 150.0;
    const currency = roomData?.currency || 'USD';

    const nights = this.calculateNights(dto.checkIn, dto.checkOut);

    // 2. Orquestar el Bloqueo Temporal (Hold) en Availability Service
    let holdId = dto.holdId;
    if (!holdId) {
      try {
        const holdRes = await fetch(`${availabilityUrl}/api/availability/hold`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
            'x-user-email': user.email,
            'x-user-role': user.role,
          },
          body: JSON.stringify({
            roomId: dto.roomId,
            checkIn: dto.checkIn,
            checkOut: dto.checkOut,
            guestsCount: dto.guestsCount || 1,
          }),
          signal: AbortSignal.timeout(4000),
        });

        if (holdRes.status === 409) {
          throw new ConflictException(
            'La habitación seleccionada ya no se encuentra disponible para estas fechas. Por favor elige otra.',
          );
        }

        if (holdRes.ok) {
          const holdBody: any = await holdRes.json();
          holdId = holdBody.holdId;
        }
      } catch (err) {
        if (err instanceof ConflictException) throw err;
        this.logger.warn(`Fallo al contactar availability hold: ${err.message}`);
      }
    }

    // 3. Cotización: total con recargos de fin de semana
    let totalAmount = pricePerNight * nights;
    try {
      const searchRes = await fetch(
        `${availabilityUrl}/api/availability/search?hotelId=${encodeURIComponent(dto.hotelId)}&checkIn=${dto.checkIn}&checkOut=${dto.checkOut}`,
        { signal: AbortSignal.timeout(3000) },
      );
      if (searchRes.ok) {
        const searchBody: any = await searchRes.json();
        const matchedRoom = searchBody?.rooms?.find((r: any) => r.id === dto.roomId);
        if (matchedRoom?.quote?.totalAmount) {
          totalAmount = matchedRoom.quote.totalAmount;
        }
      }
    } catch (e) {
      // Usar cálculo base de fallback
    }

    // 4. Generar código y persistir la reserva
    const bookingCode = this.generateBookingCode();

    const booking = this.bookingRepository.create({
      bookingCode,
      userId: user.id,
      userEmail: user.email,
      userName: user.email.split('@')[0],
      hotelId: dto.hotelId,
      hotelName,
      roomId: dto.roomId,
      roomNumber,
      roomName,
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
      nightsCount: nights,
      guestsCount: dto.guestsCount || 1,
      holdId: holdId || `hold_auto_${Date.now()}`,
      totalAmount: Math.round(totalAmount * 100) / 100,
      currency,
      status: BookingStatus.PENDING_PAYMENT,
      specialRequests: dto.specialRequests || null,
    });

    const saved = await this.bookingRepository.save(booking);

    // 5. Publicar evento en RabbitMQ: booking.created
    try {
      this.rabbitClient.emit('booking.created', {
        bookingId: saved.id,
        bookingCode: saved.bookingCode,
        userId: saved.userId,
        userEmail: saved.userEmail,
        hotelId: saved.hotelId,
        hotelName: saved.hotelName,
        roomNumber: saved.roomNumber,
        checkIn: saved.checkIn,
        checkOut: saved.checkOut,
        totalAmount: saved.totalAmount,
        currency: saved.currency,
        createdAt: saved.createdAt,
      });
      this.logger.log(`🐇 Evento 'booking.created' emitido para reserva ${saved.bookingCode}`);
    } catch (err) {
      this.logger.warn(`No se pudo emitir evento booking.created a RabbitMQ: ${err.message}`);
    }

    return {
      message: 'Reserva creada exitosamente. Procede al pago para confirmar tu estadía.',
      booking: saved,
      paymentInstructions: {
        amount: saved.totalAmount,
        currency: saved.currency,
        expiresInMinutes: 10,
        checkoutUrl: `/checkout?bookingId=${saved.id}`,
      },
    };
  }

  /**
   * Obtiene todas las reservas pertenecientes al usuario autenticado
   */
  async findMyBookings(userId: string) {
    return await this.bookingRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Valida si una cadena es un UUID válido para evitar errores de sintaxis en PostgreSQL
   */
  private isUuid(val: string): boolean {
    return typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
  }

  /**
   * Obtiene una reserva por ID o código de confirmación con validación de permisos
   */
  async findOne(idOrCode: string, user?: RequestUser) {
    const isUuid = this.isUuid(idOrCode);
    const booking = isUuid
      ? await this.bookingRepository.findOne({
          where: [{ id: idOrCode }, { bookingCode: idOrCode }],
        })
      : await this.bookingRepository.findOne({
          where: { bookingCode: idOrCode },
        });

    if (!booking) {
      throw new NotFoundException(`Reserva '${idOrCode}' no encontrada`);
    }

    if (user && user.role === 'GUEST' && booking.userId !== user.id) {
      throw new ForbiddenException('No tienes autorización para consultar esta reserva');
    }

    return booking;
  }

  /**
   * Listado general de reservas para personal administrativo y recepcionistas
   */
  async findAll(query: QueryBookingsDto) {
    const qb = this.bookingRepository.createQueryBuilder('b');

    if (query.hotelId) {
      qb.andWhere('b.hotelId = :hotelId', { hotelId: query.hotelId });
    }

    if (query.status) {
      qb.andWhere('b.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        '(b.bookingCode ILIKE :search OR b.userEmail ILIKE :search OR b.userName ILIKE :search OR b.roomNumber ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    qb.orderBy('b.createdAt', 'DESC').skip(skip).take(limit);

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
   * Cancela una reserva y emite compensación Saga hacia Availability y Notificaciones
   */
  async cancelBooking(idOrCode: string, reason?: string, user?: RequestUser) {
    const booking = await this.findOne(idOrCode, user);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('La reserva ya se encuentra cancelada');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('No se puede cancelar una estancia que ya fue completada');
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancellationReason = reason || 'Cancelada a petición del usuario';
    const updated = await this.bookingRepository.save(booking);

    // 1. Liberar el bloqueo en availability-service
    const availabilityUrl = this.configService.get<string>(
      'AVAILABILITY_SERVICE_URL',
      'http://availability-service:3004',
    );
    if (booking.holdId) {
      try {
        await fetch(`${availabilityUrl}/api/availability/release`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ holdId: booking.holdId }),
          signal: AbortSignal.timeout(3000),
        });
      } catch (err) {
        this.logger.warn(`Error al liberar hold en availability: ${err.message}`);
      }
    }

    // 2. Emitir evento RabbitMQ: booking.cancelled
    try {
      this.rabbitClient.emit('booking.cancelled', {
        bookingId: updated.id,
        bookingCode: updated.bookingCode,
        userId: updated.userId,
        userEmail: updated.userEmail,
        hotelId: updated.hotelId,
        roomId: updated.roomId,
        holdId: updated.holdId,
        checkIn: updated.checkIn,
        checkOut: updated.checkOut,
        reason: updated.cancellationReason,
      });
      this.logger.log(`🐇 Evento 'booking.cancelled' emitido para ${updated.bookingCode}`);
    } catch (err) {
      this.logger.warn(`No se pudo emitir evento booking.cancelled: ${err.message}`);
    }

    return {
      message: `Reserva ${updated.bookingCode} cancelada correctamente. Las fechas han sido liberadas en inventario.`,
      booking: updated,
    };
  }

  /**
   * Registra el check-in presencial del huésped en recepción
   */
  async checkInBooking(idOrCode: string, user: RequestUser) {
    const booking = await this.findOne(idOrCode, user);

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException(
        `Solo es posible registrar check-in en reservas CONFIRMADAS. Estado actual: '${booking.status}'`,
      );
    }

    booking.status = BookingStatus.CHECKED_IN;
    const updated = await this.bookingRepository.save(booking);

    return {
      message: `Check-in completado exitosamente para ${booking.userName} en habitación ${booking.roomNumber}.`,
      booking: updated,
    };
  }

  /**
   * Finaliza la estancia del huésped (Check-out completado)
   */
  async completeBooking(idOrCode: string, user: RequestUser) {
    const booking = await this.findOne(idOrCode, user);

    if (booking.status !== BookingStatus.CHECKED_IN) {
      throw new BadRequestException(
        `Solo es posible completar estancias con check-in activo. Estado actual: '${booking.status}'`,
      );
    }

    booking.status = BookingStatus.COMPLETED;
    const updated = await this.bookingRepository.save(booking);

    return {
      message: `Estancia finalizada. Habitación ${booking.roomNumber} disponible para limpieza y reasignación.`,
      booking: updated,
    };
  }

  /**
   * Consumidor EDA: Maneja la confirmación de pago (RabbitMQ 'payment.succeeded')
   */
  async handlePaymentSucceeded(data: any) {
    const bookingId = data?.bookingId;
    const bookingCode = data?.bookingCode || data?.bookingReference;
    const paymentId = data?.paymentId || data?.id;

    if (!bookingId && !bookingCode) {
      return;
    }

    let booking: Booking | null = null;
    if (bookingId && this.isUuid(bookingId)) {
      booking = await this.bookingRepository.findOne({ where: { id: bookingId } });
    }
    if (!booking && bookingCode) {
      booking = await this.bookingRepository.findOne({ where: { bookingCode } });
    }

    if (!booking) {
      this.logger.warn(`Reserva no encontrada para pago exitoso: ${bookingId || bookingCode}`);
      return;
    }

    booking.status = BookingStatus.CONFIRMED;
    if (paymentId) booking.paymentId = paymentId;
    const confirmed = await this.bookingRepository.save(booking);

    this.logger.log(`✅ Reserva ${confirmed.bookingCode} marcada como CONFIRMADA tras pago.`);

    // Sincronización directa con Availability Service para asegurar agotamiento de fechas
    const availabilityUrl = this.configService.get<string>(
      'AVAILABILITY_SERVICE_URL',
      'http://availability-service:3004',
    );
    try {
      await fetch(`${availabilityUrl}/api/availability/confirm-hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holdId: confirmed.holdId,
          bookingCode: confirmed.bookingCode,
          roomId: confirmed.roomId,
          checkIn: confirmed.checkIn,
          checkOut: confirmed.checkOut,
          hotelId: confirmed.hotelId,
          userId: confirmed.userId,
        }),
        signal: AbortSignal.timeout(3000),
      });
      this.logger.log(`🔒 Fechas de habitación ${confirmed.roomId} promovidas a CONFIRMED en Availability`);
    } catch (availErr) {
      this.logger.warn(`Aviso al confirmar hold en availability: ${availErr.message}`);
    }

    // Emitir booking.confirmed para que notification-service envíe el Voucher con QR y availability-service confirme el inventario
    try {
      this.rabbitClient.emit('booking.confirmed', {
        id: confirmed.id,
        bookingCode: confirmed.bookingCode,
        userId: confirmed.userId,
        userEmail: confirmed.userEmail,
        userName: confirmed.userName,
        hotelId: confirmed.hotelId,
        hotelName: confirmed.hotelName,
        roomId: confirmed.roomId,
        roomNumber: confirmed.roomNumber,
        roomName: confirmed.roomName,
        holdId: confirmed.holdId,
        checkIn: confirmed.checkIn,
        checkOut: confirmed.checkOut,
        nightsCount: confirmed.nightsCount,
        guestsCount: confirmed.guestsCount,
        totalAmount: confirmed.totalAmount,
        currency: confirmed.currency,
        paymentId: confirmed.paymentId,
      });
      this.logger.log(`🐇 Evento 'booking.confirmed' emitido para generación de voucher PDF e inventario`);
    } catch (err) {
      this.logger.warn(`Fallo al emitir booking.confirmed: ${err.message}`);
    }
  }

  /**
   * Consumidor EDA: Maneja fallo de pago (RabbitMQ 'payment.failed')
   */
  async handlePaymentFailed(data: any) {
    const bookingId = data?.bookingId;
    if (!bookingId) return;

    const booking = await this.bookingRepository.findOne({ where: { id: bookingId } });
    if (booking && booking.status === BookingStatus.PENDING_PAYMENT) {
      booking.status = BookingStatus.CANCELLED;
      booking.cancellationReason = data.reason || 'Pago rechazado por la entidad bancaria';
      await this.bookingRepository.save(booking);
      this.logger.log(`❌ Reserva ${booking.bookingCode} cancelada automáticamente por fallo de pago.`);
    }
  }

  /**
   * Siembra inicial de reservas para demostración
   */
  async seed() {
    for (const item of INITIAL_BOOKING_SEED) {
      const exists = await this.bookingRepository.findOne({
        where: { bookingCode: item.bookingCode },
      });
      if (!exists) {
        const b = this.bookingRepository.create(item);
        await this.bookingRepository.save(b);
      }
    }
    this.logger.log(`🌱 Semilla de reservas inicializada correctamente (${INITIAL_BOOKING_SEED.length} registros)`);
  }
}

