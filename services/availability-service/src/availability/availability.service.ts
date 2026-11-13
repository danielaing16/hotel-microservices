import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RoomReservation } from './entities/room-reservation.entity';
import { RedisService } from '../redis/redis.service';
import { SearchAvailabilityDto } from './dto/search-availability.dto';
import { HoldRoomDto } from './dto/hold-room.dto';
import { CalendarQueryDto } from './dto/calendar-query.dto';
import { ReservationStatus } from '../common/enums/reservation-status.enum';
import { INITIAL_AVAILABILITY_SEED } from './seed/availability.seed';

@Injectable()
export class AvailabilityService implements OnModuleInit {
  private readonly logger = new Logger(AvailabilityService.name);

  constructor(
    @InjectRepository(RoomReservation)
    private readonly reservationRepository: Repository<RoomReservation>,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      const count = await this.reservationRepository.count();
      if (count === 0) {
        this.logger.log('Inicializando registros de disponibilidad con datos semilla...');
        await this.seed();
      }
    } catch (err) {
      this.logger.warn(`No se pudo verificar o sembrar disponibilidad inicial: ${err.message}`);
    }
  }

  /**
   * Calcula la cotización dinámica con soporte de temporadas, ofertas y recargo de fin de semana (+15%)
   */
  calculateQuotation(
    pricePerNight: number,
    checkIn: string,
    checkOut: string,
    currency = 'USD',
    season = 'REGULAR',
    discountPercentage = 0,
    offerDescription?: string,
  ) {
    const dates = this.redisService.getDatesBetween(checkIn, checkOut);
    const nights = dates.length;

    // Modificador de temporada (ALTA: +20%, BAJA: -10%, REGULAR: 0%)
    const seasonMultiplier = season === 'ALTA' ? 1.2 : (season === 'BAJA' ? 0.9 : 1.0);
    const adjustedBase = Math.round(pricePerNight * seasonMultiplier * 100) / 100;

    let totalAmount = 0;
    let surcharges = 0;
    const subtotal = Math.round(adjustedBase * nights * 100) / 100;

    for (const dStr of dates) {
      const date = new Date(`${dStr}T00:00:00Z`);
      const dayOfWeek = date.getUTCDay(); // 5 = Viernes, 6 = Sábado
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        const weekendExtra = Math.round(adjustedBase * 0.15 * 100) / 100;
        surcharges += weekendExtra;
        totalAmount += adjustedBase + weekendExtra;
      } else {
        totalAmount += adjustedBase;
      }
    }

    // Aplicar descuento u oferta promocional
    const discountFactor = Math.min(Math.max(Number(discountPercentage) || 0, 0), 90) / 100;
    const discountAmount = Math.round(totalAmount * discountFactor * 100) / 100;
    const finalTotal = Math.max(0, Math.round((totalAmount - discountAmount) * 100) / 100);

    return {
      nights,
      basePricePerNight: pricePerNight,
      season: season || 'REGULAR',
      seasonMultiplier,
      discountPercentage: Number(discountPercentage) || 0,
      discountAmount,
      offerDescription: offerDescription || null,
      subtotal,
      surcharges: Math.round(surcharges * 100) / 100,
      totalAmount: finalTotal,
      currency,
    };
  }

  /**
   * Búsqueda en tiempo real de habitaciones disponibles
   * Cruza inventario contra reservas en DB y Soft-Locks en Redis
   */
  async searchAvailability(query: SearchAvailabilityDto) {
    if (query.checkIn >= query.checkOut) {
      throw new BadRequestException('La fecha de checkIn debe ser estrictamente anterior a checkOut');
    }

    const roomsUrl = this.configService.get<string>(
      'ROOMS_SERVICE_URL',
      'http://rooms-service:3003',
    );

    // 1. Obtener habitaciones del hotel desde rooms-service
    let allRooms: any[] = [];
    try {
      const res = await fetch(`${roomsUrl}/api/rooms?hotelId=${encodeURIComponent(query.hotelId)}&limit=100`, {
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const body: any = await res.json();
        allRooms = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
      }
    } catch (err) {
      this.logger.warn(`No se pudo consultar catálogo de habitaciones en ${roomsUrl}: ${err.message}`);
    }

    // 2. Filtrar por capacidad y tipo de habitación
    const minAdults = query.adults || 1;
    const minChildren = query.children || 0;
    const candidateRooms = allRooms.filter((r) => {
      const capacityOk = (r.maxAdults ?? 2) >= minAdults && (r.maxChildren ?? 0) >= minChildren;
      const typeOk = !query.roomType || r.roomType === query.roomType;
      const statusOk = r.status === 'AVAILABLE' && r.isActive !== false;
      return capacityOk && typeOk && statusOk;
    });

    const availableRooms = [];

    // 3. Evaluar solapamientos en Base de Datos y en Redis para cada habitación
    for (const room of candidateRooms) {
      // 3.1. Consulta de solapamiento en PostgreSQL
      // Solapamiento: (check_in < new_checkout) AND (check_out > new_checkin)
      const now = new Date();
      const conflictDb = await this.reservationRepository
        .createQueryBuilder('res')
        .where('res.roomId = :roomId', { roomId: room.id })
        .andWhere('res.checkIn < :checkOut', { checkOut: query.checkOut })
        .andWhere('res.checkOut > :checkIn', { checkIn: query.checkIn })
        .andWhere(
          '(res.status = :confirmed OR (res.status = :hold AND res.expiresAt > :now))',
          {
            confirmed: ReservationStatus.CONFIRMED,
            hold: ReservationStatus.HOLD,
            now,
          },
        )
        .getOne();

      if (conflictDb) {
        continue; // Habitación ocupada en BD
      }

      // 3.2. Consulta de soft-locks activos en Redis
      const isLockedRedis = await this.redisService.isRoomLocked(room.id, query.checkIn, query.checkOut);
      if (isLockedRedis) {
        continue; // Habitación temporalmente bloqueada en Redis por otro usuario en checkout
      }

      // 3.3. Habitación disponible: calcular cotización dinámica
      const price = room.pricePerNight || 120.0;
      const quote = this.calculateQuotation(
        price,
        query.checkIn,
        query.checkOut,
        room.currency || 'USD',
        room.season,
        room.discountPercentage,
        room.offerDescription,
      );

      availableRooms.push({
        id: room.id,
        roomNumber: room.roomNumber,
        name: room.name,
        roomType: room.roomType,
        hotelId: room.hotelId,
        hotelName: room.hotelName,
        maxAdults: room.maxAdults,
        maxChildren: room.maxChildren,
        bedType: room.bedType,
        sizeSqm: room.sizeSqm,
        viewType: room.viewType,
        images: room.images || [],
        amenities: room.amenities || [],
        quote,
      });
    }

    return {
      hotelId: query.hotelId,
      checkIn: query.checkIn,
      checkOut: query.checkOut,
      totalAvailable: availableRooms.length,
      rooms: availableRooms,
    };
  }

  /**
   * Crea un bloqueo temporal de 15 minutos (Soft-Lock / Hold)
   * Garantiza anti-overbooking mediante script Lua en Redis y registro en PostgreSQL
   */
  async createHold(dto: HoldRoomDto, userId: string) {
    if (dto.checkIn >= dto.checkOut) {
      throw new BadRequestException('La fecha de checkIn debe ser estrictamente anterior a checkOut');
    }

    const ttl = dto.ttlSeconds || 900; // 15 minutos por defecto
    const now = new Date();

    // 1. Verificar solapamiento en base de datos
    const conflictDb = await this.reservationRepository
      .createQueryBuilder('res')
      .where('res.roomId = :roomId', { roomId: dto.roomId })
      .andWhere('res.checkIn < :checkOut', { checkOut: dto.checkOut })
      .andWhere('res.checkOut > :checkIn', { checkIn: dto.checkIn })
      .andWhere(
        '(res.status = :confirmed OR (res.status = :hold AND res.expiresAt > :now))',
        {
          confirmed: ReservationStatus.CONFIRMED,
          hold: ReservationStatus.HOLD,
          now,
        },
      )
      .getOne();

    if (conflictDb) {
      throw new ConflictException(
        `La habitación ya se encuentra reservada o en proceso de compra para las fechas seleccionadas`,
      );
    }

    // 2. Generar identificador único de Hold
    const holdId = `hold_${Math.random().toString(36).substring(2, 8)}_${Date.now().toString(36)}`;

    // 3. Adquirir candado atómico en Redis
    const lockResult = await this.redisService.acquireHold(
      holdId,
      dto.roomId,
      dto.checkIn,
      dto.checkOut,
      userId,
      ttl,
    );

    if (!lockResult.success) {
      throw new ConflictException(
        `Conflicto temporal: La noche del ${lockResult.conflictingDate || 'rango'} acaba de ser tomada por otro usuario en proceso de reserva.`,
      );
    }

    // 4. Persistir registro de Hold en PostgreSQL
    const expiresAt = new Date(Date.now() + ttl * 1000);
    const holdRecord = this.reservationRepository.create({
      holdId,
      roomId: dto.roomId,
      hotelId: 'auto_resolved',
      userId,
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
      status: ReservationStatus.HOLD,
      guestsCount: dto.guestsCount || 1,
      expiresAt,
    });

    try {
      const saved = await this.reservationRepository.save(holdRecord);
      this.logger.log(`✨ Hold registrado exitosamente: ID=${saved.holdId} para usuario ${userId}`);

      return {
        message: 'Bloqueo temporal de habitación adquirido con éxito. Tienes 10 minutos para completar el pago.',
        holdId: saved.holdId,
        roomId: saved.roomId,
        checkIn: saved.checkIn,
        checkOut: saved.checkOut,
        expiresAt: saved.expiresAt,
        ttlSeconds: ttl,
      };
    } catch (err) {
      // Revertir Redis si falla DB
      await this.redisService.releaseHold(holdId, dto.roomId, dto.checkIn, dto.checkOut);
      throw new ConflictException(`Error al persistir bloqueo temporal: ${err.message}`);
    }
  }

  /**
   * Libera anticipadamente un bloqueo temporal (Hold)
   */
  async releaseHold(holdId: string, userId?: string, isAdmin = false) {
    const hold = await this.reservationRepository.findOne({
      where: { holdId },
    });

    if (!hold) {
      throw new NotFoundException(`Bloqueo con ID '${holdId}' no encontrado`);
    }

    if (!isAdmin && userId && hold.userId !== userId) {
      throw new BadRequestException('No estás autorizado para liberar este bloqueo');
    }

    await this.redisService.releaseHold(hold.holdId, hold.roomId, hold.checkIn, hold.checkOut);

    hold.status = ReservationStatus.RELEASED;
    await this.reservationRepository.save(hold);

    return {
      message: `Bloqueo '${holdId}' liberado satisfactoriamente`,
      holdId,
      status: ReservationStatus.RELEASED,
    };
  }

  /**
   * Consulta el calendario mensual de ocupación de una habitación específica
   */
  async getRoomCalendar(roomId: string, query: CalendarQueryDto) {
    const year = query.year || new Date().getFullYear();
    const month = query.month || new Date().getMonth() + 1;

    const monthStr = month.toString().padStart(2, '0');
    const yearMonth = `${year}-${monthStr}`;

    const startDate = `${yearMonth}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${yearMonth}-${lastDay.toString().padStart(2, '0')}`;

    const now = new Date();

    // 1. Reservas en PostgreSQL
    const reservations = await this.reservationRepository
      .createQueryBuilder('res')
      .where('res.roomId = :roomId', { roomId })
      .andWhere('res.checkIn <= :endDate AND res.checkOut >= :startDate', {
        startDate,
        endDate,
      })
      .andWhere(
        '(res.status = :confirmed OR (res.status = :hold AND res.expiresAt > :now))',
        {
          confirmed: ReservationStatus.CONFIRMED,
          hold: ReservationStatus.HOLD,
          now,
        },
      )
      .getMany();

    // 2. Soft-locks en Redis
    const lockedNightsRedis = await this.redisService.getLockedNightsForRoom(roomId, yearMonth);

    // 3. Mapear día por día
    const days = [];
    for (let day = 1; day <= lastDay; day++) {
      const dayDateStr = `${yearMonth}-${day.toString().padStart(2, '0')}`;
      let status: 'AVAILABLE' | 'HOLD' | 'BOOKED' = 'AVAILABLE';
      let details = null;

      // Evaluar si alguna reserva cubre esta noche
      for (const res of reservations) {
        if (dayDateStr >= res.checkIn && dayDateStr < res.checkOut) {
          if (res.status === ReservationStatus.CONFIRMED) {
            if (res.bookingReference && res.bookingReference.startsWith('BLOQUEO-ADMIN')) {
              status = 'BLOCKED' as any;
              details = { ref: res.bookingReference };
            } else {
              status = 'BOOKED';
              details = { ref: res.bookingReference };
            }
            break;
          } else if (res.status === ReservationStatus.HOLD) {
            status = 'HOLD';
            details = { expiresAt: res.expiresAt };
          }
        }
      }

      if (status === 'AVAILABLE' && lockedNightsRedis.includes(dayDateStr)) {
        status = 'HOLD';
      }

      days.push({
        date: dayDateStr,
        day,
        status,
        details,
      });
    }

    return {
      roomId,
      year,
      month,
      totalDays: lastDay,
      calendar: days,
    };
  }

  // =========================================================================
  // CONSUMIDORES DE EVENTOS ASÍNCRONOS (RABBITMQ)
  // =========================================================================

  /**
   * Convierte un hold en reserva confirmada definitiva tras éxito en pago
   */
  async handlePaymentSucceeded(event: any) {
    this.logger.log(`📥 [RabbitMQ] Procesando 'payment.succeeded' en Availability: ${JSON.stringify(event?.bookingCode || event?.bookingReference || event?.holdId)}`);
    const holdId = event.holdId || event.bookingId;

    let hold = holdId ? await this.reservationRepository.findOne({ where: { holdId } }) : null;
    if (!hold && (event.bookingCode || event.bookingReference)) {
      hold = await this.reservationRepository.findOne({
        where: { bookingReference: event.bookingCode || event.bookingReference },
      });
    }

    if (hold) {
      hold.status = ReservationStatus.CONFIRMED;
      hold.bookingReference = event.bookingCode || event.bookingReference || hold.bookingReference;
      await this.reservationRepository.save(hold);
      this.logger.log(`✅ Hold '${hold.holdId}' promovido a CONFIRMED permanentemente`);
    }
  }

  /**
   * Procesa la confirmación definitiva emitida por booking-service
   */
  async handleBookingConfirmed(event: any) {
    this.logger.log(`📥 [RabbitMQ] Procesando 'booking.confirmed' en Availability: ${event?.bookingCode}`);
    const holdId = event.holdId;
    let record = holdId ? await this.reservationRepository.findOne({ where: { holdId } }) : null;

    if (!record && event.bookingCode) {
      record = await this.reservationRepository.findOne({ where: { bookingReference: event.bookingCode } });
    }

    if (record) {
      record.status = ReservationStatus.CONFIRMED;
      record.bookingReference = event.bookingCode;
      await this.reservationRepository.save(record);
      this.logger.log(`✅ Disponibilidad confirmada para reserva ${event.bookingCode}`);
    } else if (event.roomId && event.checkIn && event.checkOut) {
      // Si la reserva no tenía hold previo en DB, crear el registro confirmado
      const newConfirmed = this.reservationRepository.create({
        holdId: `conf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        roomId: event.roomId,
        hotelId: event.hotelId || 'resolved',
        userId: event.userId || 'guest',
        checkIn: event.checkIn,
        checkOut: event.checkOut,
        status: ReservationStatus.CONFIRMED,
        bookingReference: event.bookingCode,
        guestsCount: event.guestsCount || 1,
        totalAmount: event.totalAmount || 0,
        currency: event.currency || 'USD',
      });
      await this.reservationRepository.save(newConfirmed);
      this.logger.log(`✅ Reserva '${event.bookingCode}' registrada directamente como CONFIRMED`);
    }
  }

  /**
   * Bloqueo manual/administrativo de fechas para una habitación (Exclusivo HOTEL_ADMIN)
   */
  async blockDatesAdmin(dto: any, userId: string) {
    if (dto.checkIn >= dto.checkOut) {
      throw new BadRequestException('La fecha de checkIn debe ser estrictamente anterior a checkOut');
    }

    const holdId = `block_admin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const reason = dto.reason || 'Bloqueo administrativo / Mantenimiento';

    const blockRecord = this.reservationRepository.create({
      holdId,
      roomId: dto.roomId,
      hotelId: dto.hotelId || 'admin_block',
      userId,
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
      status: ReservationStatus.CONFIRMED, // Ocupa las fechas permanentemente
      bookingReference: `BLOQUEO-ADMIN: ${reason}`,
      guestsCount: 0,
      currency: 'USD',
      totalAmount: 0,
    });

    const saved = await this.reservationRepository.save(blockRecord);
    this.logger.log(`🚫 Fechas bloqueadas por administración para habitación ${dto.roomId} (${dto.checkIn} a ${dto.checkOut})`);

    return {
      message: `Fechas del ${dto.checkIn} al ${dto.checkOut} bloqueadas exitosamente por administración.`,
      blockId: saved.holdId,
      roomId: dto.roomId,
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
      reason,
    };
  }

  /**
   * Habilitación / Desbloqueo de fechas bloqueadas por administración
   */
  async unblockDatesAdmin(dto: { roomId: string; checkIn: string; checkOut: string }) {
    const records = await this.reservationRepository
      .createQueryBuilder('res')
      .where('res.roomId = :roomId', { roomId: dto.roomId })
      .andWhere('res.checkIn >= :checkIn AND res.checkOut <= :checkOut', {
        checkIn: dto.checkIn,
        checkOut: dto.checkOut,
      })
      .andWhere('res.bookingReference LIKE :prefix', { prefix: 'BLOQUEO-ADMIN%' })
      .getMany();

    for (const r of records) {
      r.status = ReservationStatus.RELEASED;
      await this.reservationRepository.save(r);
    }

    this.logger.log(`✅ ${records.length} bloqueo(s) administrativo(s) liberados para habitación ${dto.roomId}`);

    return {
      message: `Fechas habilitadas exitosamente para venta al público (${records.length} bloqueo(s) removido(s)).`,
      unblockedCount: records.length,
    };
  }

  /**
   * Libera el hold inmediatamente si el pago falló o la reserva fue cancelada
   */
  async handlePaymentFailedOrCancelled(event: any) {
    this.logger.log(`📥 [RabbitMQ] Procesando cancelación/fallo en Availability: ${JSON.stringify(event?.bookingId || event?.holdId)}`);
    const holdId = event.holdId || event.bookingId;
    if (!holdId) return;

    try {
      await this.releaseHold(holdId, undefined, true);
      this.logger.log(`🔓 Disponibilidad restaurada tras cancelación/fallo para hold '${holdId}'`);
    } catch (err) {
      this.logger.debug(`Aviso: ${err.message}`);
    }
  }

  async seed(): Promise<{ message: string; count: number }> {
    let createdCount = 0;
    for (const item of INITIAL_AVAILABILITY_SEED) {
      const exists = await this.reservationRepository.findOne({
        where: { holdId: item.holdId },
      });
      if (!exists) {
        const res = this.reservationRepository.create(item);
        await this.reservationRepository.save(res);
        createdCount++;
      }
    }
    return {
      message: `Semilla de disponibilidad completada. ${createdCount} registros iniciales creados.`,
      count: createdCount,
    };
  }
}

