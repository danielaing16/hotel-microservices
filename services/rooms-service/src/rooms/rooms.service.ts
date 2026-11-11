import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomQueryDto } from './dto/room-query.dto';
import { PaginatedRoomsResponseDto } from './dto/room-response.dto';
import { INITIAL_ROOMS_SEED } from './seed/rooms.seed';
import { RoomStatus } from '../common/enums/room-status.enum';
import { RequestUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class RoomsService implements OnModuleInit {
  private readonly logger = new Logger(RoomsService.name);
  private lastSyncTime = 0;
  private cachedSlugMap = new Map<string, { id: string; name: string }>();
  private readonly SYNC_TTL_MS = 60000; // 60 segundos de caché para evitar consultas redundantes

  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      const count = await this.roomRepository.count();
      if (count === 0) {
        this.logger.log(
          'Base de datos de habitaciones vacía. Inicializando inventario con datos seed...',
        );
        await this.seed();
        this.logger.log('✨ Habitaciones semilla insertadas exitosamente.');
      } else {
        await this.syncHotelsFromCatalog(true);
      }
    } catch (err) {
      this.logger.warn(
        `No se pudo verificar o sembrar habitaciones iniciales: ${err.message}`,
      );
    }
  }

  /**
   * Sincroniza los UUIDs reales de los hoteles desde hotels-service si está en línea,
   * emparejando por slug para que GET /api/rooms/hotel/:hotelId funcione con los UUIDs reales.
   */
  async syncHotelsFromCatalog(force = false): Promise<Map<string, { id: string; name: string }>> {
    const now = Date.now();
    if (!force && this.cachedSlugMap.size > 0 && now - this.lastSyncTime < this.SYNC_TTL_MS) {
      return this.cachedSlugMap;
    }

    const slugMap = new Map<string, { id: string; name: string }>();
    const hotelsUrl = this.configService.get<string>(
      'HOTELS_SERVICE_URL',
      'http://hotels-service:3002',
    );

    try {
      const response = await fetch(`${hotelsUrl}/api/hotels?limit=100`, {
        signal: AbortSignal.timeout(2500),
      });
      if (response.ok) {
        const body: any = await response.json();
        const hotels = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
        for (const h of hotels) {
          if (h.slug && h.id) {
            slugMap.set(h.slug, { id: h.id, name: h.name });
          }
        }

        if (slugMap.size > 0) {
          const existingRooms = await this.roomRepository.find();
          for (const room of existingRooms) {
            if (room.hotelSlug && slugMap.has(room.hotelSlug)) {
              const matched = slugMap.get(room.hotelSlug);
              if (room.hotelId !== matched.id || room.hotelName !== matched.name) {
                room.hotelId = matched.id;
                room.hotelName = matched.name;
                await this.roomRepository.save(room);
              }
            }
          }
          this.cachedSlugMap = slugMap;
          this.lastSyncTime = now;
        }
      }
    } catch (err) {
      this.logger.debug(
        `Sincronización opcional con hotels-service omitida (${err.message})`,
      );
    }

    return slugMap.size > 0 ? slugMap : this.cachedSlugMap;
  }

  async create(createRoomDto: CreateRoomDto, adminUserId?: string): Promise<Room> {
    // Verificar que no exista el mismo número de habitación en el mismo hotel
    const duplicate = await this.roomRepository.findOne({
      where: {
        hotelId: createRoomDto.hotelId,
        roomNumber: createRoomDto.roomNumber,
      },
    });

    if (duplicate) {
      throw new ConflictException(
        `Ya existe la habitación número '${createRoomDto.roomNumber}' registrada en este hotel`,
      );
    }

    const pricePerNight = Number(createRoomDto.pricePerNight);
    const basePriceCents =
      createRoomDto.basePriceCents ?? Math.round(pricePerNight * 100);

    const room = this.roomRepository.create({
      ...createRoomDto,
      pricePerNight,
      basePriceCents,
      hotelName: createRoomDto.hotelName || 'Sede Hotelera Principal',
      currency: createRoomDto.currency || 'USD',
      floor: createRoomDto.floor ?? 1,
      maxAdults: createRoomDto.maxAdults ?? 2,
      maxChildren: createRoomDto.maxChildren ?? 1,
      bedType: createRoomDto.bedType || '1 Cama King',
      bedsCount: createRoomDto.bedsCount ?? 1,
      sizeSqm: createRoomDto.sizeSqm ?? 32,
      viewType: createRoomDto.viewType || 'Vista Panorámica',
      status: createRoomDto.status || RoomStatus.AVAILABLE,
      breakfastIncluded: createRoomDto.breakfastIncluded ?? true,
      isSmokingAllowed: createRoomDto.isSmokingAllowed ?? false,
      isActive: createRoomDto.isActive ?? true,
      adminUserId: adminUserId || null,
      amenities:
        createRoomDto.amenities && createRoomDto.amenities.length > 0
          ? createRoomDto.amenities
          : ['Aire Acondicionado', 'Smart TV 55"', 'WiFi Alta Velocidad', 'Caja Fuerte'],
      images:
        createRoomDto.images && createRoomDto.images.length > 0
          ? createRoomDto.images
          : [
              'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
            ],
    });

    try {
      const saved = await this.roomRepository.save(room);
      this.logger.log(
        `Habitación creada: #${saved.roomNumber} - "${saved.name}" (Hotel: ${saved.hotelName})`,
      );
      return saved;
    } catch (error) {
      this.logger.error(`Error al persistir habitación: ${error.message}`);
      throw new ConflictException(`No se pudo registrar la habitación: ${error.message}`);
    }
  }

  async findAll(query: RoomQueryDto): Promise<PaginatedRoomsResponseDto> {
    await this.syncHotelsFromCatalog();

    const qb: SelectQueryBuilder<Room> = this.roomRepository.createQueryBuilder('room');

    if (query.isActive !== undefined) {
      qb.andWhere('room.isActive = :isActive', { isActive: query.isActive });
    } else {
      qb.andWhere('room.isActive = :isActive', { isActive: true });
    }

    if (query.hotelId) {
      qb.andWhere(
        '(room.hotelId = :hotelId OR LOWER(room.hotelSlug) = :hotelSlug)',
        {
          hotelId: query.hotelId,
          hotelSlug: query.hotelId.toLowerCase(),
        },
      );
    }

    if (query.roomType) {
      qb.andWhere('room.roomType = :roomType', { roomType: query.roomType });
    }

    if (query.status) {
      qb.andWhere('room.status = :status', { status: query.status });
    }

    if (query.minPrice !== undefined) {
      qb.andWhere('room.pricePerNight >= :minPrice', { minPrice: query.minPrice });
    }

    if (query.maxPrice !== undefined) {
      qb.andWhere('room.pricePerNight <= :maxPrice', { maxPrice: query.maxPrice });
    }

    if (query.minAdults !== undefined) {
      qb.andWhere('room.maxAdults >= :minAdults', { minAdults: query.minAdults });
    }

    if (query.minChildren !== undefined) {
      qb.andWhere('room.maxChildren >= :minChildren', {
        minChildren: query.minChildren,
      });
    }

    if (query.floor !== undefined) {
      qb.andWhere('room.floor = :floor', { floor: query.floor });
    }

    if (query.breakfastIncluded !== undefined) {
      qb.andWhere('room.breakfastIncluded = :breakfastIncluded', {
        breakfastIncluded: query.breakfastIncluded,
      });
    }

    if (query.search) {
      qb.andWhere(
        '(LOWER(room.name) LIKE :search OR LOWER(room.description) LIKE :search OR LOWER(room.roomNumber) LIKE :search OR LOWER(room.hotelName) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    qb.orderBy('room.hotelName', 'ASC');
    qb.addOrderBy('room.pricePerNight', 'ASC');
    qb.addOrderBy('room.roomNumber', 'ASC');

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 24;
    const skip = (page - 1) * limit;

    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findByHotel(hotelIdOrSlug: string) {
    await this.syncHotelsFromCatalog();

    const rooms = await this.roomRepository
      .createQueryBuilder('room')
      .where('room.isActive = :isActive', { isActive: true })
      .andWhere(
        '(room.hotelId = :hotelId OR LOWER(room.hotelSlug) = :hotelSlug)',
        {
          hotelId: hotelIdOrSlug,
          hotelSlug: hotelIdOrSlug.toLowerCase(),
        },
      )
      .orderBy('room.pricePerNight', 'ASC')
      .addOrderBy('room.roomNumber', 'ASC')
      .getMany();

    const availableCount = rooms.filter((r) => r.status === RoomStatus.AVAILABLE).length;
    const prices = rooms.map((r) => r.pricePerNight);

    return {
      hotelId: hotelIdOrSlug,
      hotelName: rooms[0]?.hotelName || null,
      totalRooms: rooms.length,
      availableRooms: availableCount,
      minPricePerNight: prices.length > 0 ? Math.min(...prices) : null,
      maxPricePerNight: prices.length > 0 ? Math.max(...prices) : null,
      rooms,
    };
  }

  async getRoomTypesCatalog(hotelId?: string) {
    await this.syncHotelsFromCatalog();

    const qb = this.roomRepository
      .createQueryBuilder('room')
      .where('room.isActive = :isActive', { isActive: true });

    if (hotelId) {
      qb.andWhere(
        '(room.hotelId = :hotelId OR LOWER(room.hotelSlug) = :hotelSlug)',
        {
          hotelId,
          hotelSlug: hotelId.toLowerCase(),
        },
      );
    }

    const rooms = await qb.getMany();
    const grouped: Record<string, any> = {};

    for (const room of rooms) {
      if (!grouped[room.roomType]) {
        grouped[room.roomType] = {
          roomType: room.roomType,
          totalRooms: 0,
          availableRooms: 0,
          minPricePerNight: room.pricePerNight,
          maxPricePerNight: room.pricePerNight,
          maxAdultsCapacity: room.maxAdults,
          sampleImage: room.images?.[0] || null,
        };
      }
      const group = grouped[room.roomType];
      group.totalRooms += 1;
      if (room.status === RoomStatus.AVAILABLE) {
        group.availableRooms += 1;
      }
      group.minPricePerNight = Math.min(group.minPricePerNight, room.pricePerNight);
      group.maxPricePerNight = Math.max(group.maxPricePerNight, room.pricePerNight);
      group.maxAdultsCapacity = Math.max(group.maxAdultsCapacity, room.maxAdults);
    }

    return {
      totalTypes: Object.keys(grouped).length,
      types: Object.values(grouped),
    };
  }

  async findOne(id: string): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { id },
    });

    if (!room) {
      throw new NotFoundException(`Habitación con identificador '${id}' no encontrada`);
    }

    return room;
  }

  async update(
    id: string,
    updateRoomDto: UpdateRoomDto,
    _user?: RequestUser,
  ): Promise<Room> {
    const room = await this.findOne(id);

    if (updateRoomDto.pricePerNight !== undefined && updateRoomDto.basePriceCents === undefined) {
      updateRoomDto.basePriceCents = Math.round(Number(updateRoomDto.pricePerNight) * 100);
    }

    Object.assign(room, updateRoomDto);
    return await this.roomRepository.save(room);
  }

  async updateStatus(
    id: string,
    status: RoomStatus,
    _user?: RequestUser,
  ): Promise<Room> {
    const room = await this.findOne(id);
    room.status = status;
    if (status === RoomStatus.INACTIVE) {
      room.isActive = false;
    } else {
      room.isActive = true;
    }
    return await this.roomRepository.save(room);
  }

  async remove(
    id: string,
    force = false,
    _user?: RequestUser,
  ): Promise<{ message: string; id: string }> {
    const room = await this.findOne(id);

    if (force) {
      await this.roomRepository.remove(room);
      return {
        message: `Habitación #${room.roomNumber} ('${room.name}') eliminada permanentemente del inventario`,
        id,
      };
    }

    room.isActive = false;
    room.status = RoomStatus.INACTIVE;
    await this.roomRepository.save(room);

    return {
      message: `Habitación #${room.roomNumber} ('${room.name}') dada de baja exitosamente (Soft Delete)`,
      id,
    };
  }

  async seed(adminUserId?: string): Promise<{ message: string; count: number }> {
    const slugMap = await this.syncHotelsFromCatalog();
    let createdCount = 0;

    for (const item of INITIAL_ROOMS_SEED) {
      const matchedHotel = item.hotelSlug ? slugMap.get(item.hotelSlug) : undefined;
      const effectiveHotelId = matchedHotel?.id || item.hotelId;
      const effectiveHotelName = matchedHotel?.name || item.hotelName;

      const exists = await this.roomRepository.findOne({
        where: [
          { hotelId: effectiveHotelId, roomNumber: item.roomNumber },
          { hotelSlug: item.hotelSlug, roomNumber: item.roomNumber },
        ],
      });

      if (!exists) {
        const room = this.roomRepository.create({
          ...item,
          hotelId: effectiveHotelId,
          hotelName: effectiveHotelName,
          adminUserId: adminUserId || null,
        });
        await this.roomRepository.save(room);
        createdCount++;
      } else if (matchedHotel && exists.hotelId !== matchedHotel.id) {
        exists.hotelId = matchedHotel.id;
        exists.hotelName = matchedHotel.name;
        await this.roomRepository.save(exists);
      }
    }

    return {
      message: `Proceso de seed completado. ${createdCount} nuevas habitaciones insertadas y vinculadas al catálogo hotelero.`,
      count: createdCount,
    };
  }
}

