import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { UpdateRoomStatusDto } from './dto/update-room-status.dto';
import { RoomQueryDto } from './dto/room-query.dto';
import { PaginatedRoomsResponseDto } from './dto/room-response.dto';
import { Room } from './entities/room.entity';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Habitaciones & Tipos (Inventario Físico)')
@Controller('api/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Listar habitaciones con filtros multicriterio y paginación (Lectura Pública)',
    description:
      'Permite buscar habitaciones filtrando por hotel, tipo (STANDARD, DELUXE, JUNIOR_SUITE, PRESIDENTIAL_SUITE, PENTHOUSE), rango de precios, capacidad de huéspedes y estado.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inventario de habitaciones obtenido exitosamente',
    type: PaginatedRoomsResponseDto,
  })
  async findAll(@Query() query: RoomQueryDto): Promise<PaginatedRoomsResponseDto> {
    return await this.roomsService.findAll(query);
  }

  @Public()
  @Get('types')
  @ApiOperation({
    summary: 'Resumen del catálogo por tipos de habitación (Lectura Pública)',
    description:
      'Agrupa el inventario por categoría de habitación con tarifas mínimas/máximas y unidades disponibles.',
  })
  @ApiQuery({
    name: 'hotelId',
    required: false,
    description: 'UUID o slug del hotel opcional para filtrar tipos de ese hotel',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Resumen de tipos de habitación obtenido con éxito',
  })
  async getRoomTypes(@Query('hotelId') hotelId?: string) {
    return await this.roomsService.getRoomTypesCatalog(hotelId);
  }

  @Public()
  @Get('hotel/:hotelId')
  @ApiOperation({
    summary: 'Listar tipos de habitación e inventario de un hotel específico (Lectura Pública)',
    description:
      'Retorna todas las habitaciones asociadas a un hotel (por UUID o slug) junto con métricas de disponibilidad y tarifas.',
  })
  @ApiParam({
    name: 'hotelId',
    description: 'UUID o slug del hotel',
    example: 'cartagena-luxury-beach-spa-resort',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inventario del hotel obtenido exitosamente',
  })
  async findByHotel(@Param('hotelId') hotelId: string) {
    return await this.roomsService.findByHotel(hotelId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Consultar detalle completo de una habitación por UUID (Lectura Pública)',
    description:
      'Obtiene capacidad, tarifa base, amenidades, estado operativo y fotos de una habitación específica.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la habitación',
    example: 'c7f99120-51b2-4e82-9a11-72819f441a01',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detalle de la habitación obtenido exitosamente',
    type: Room,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Habitación no encontrada',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Room> {
    return await this.roomsService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Registrar una nueva habitación en el inventario (Solo HOTEL_ADMIN)',
    description:
      'Crea una habitación física asociada a un hotel con su tipo, tarifa por noche, capacidad y amenidades.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Habitación creada y registrada exitosamente',
    type: Room,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acceso denegado: Se requiere rol HOTEL_ADMIN',
  })
  async create(
    @Body() createRoomDto: CreateRoomDto,
    @CurrentUser() user: RequestUser,
  ): Promise<Room> {
    return await this.roomsService.create(createRoomDto, user?.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar completamente una habitación (Solo HOTEL_ADMIN)',
    description:
      'Modifica tarifa base, capacidad, amenidades, fotos o estado de mantenimiento de una habitación.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la habitación a actualizar' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Habitación actualizada exitosamente',
    type: Room,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoomDto: UpdateRoomDto,
    @CurrentUser() user: RequestUser,
  ): Promise<Room> {
    return await this.roomsService.update(id, updateRoomDto, user);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.HOTEL_ADMIN, Role.RECEPTIONIST)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar parcialmente una habitación (HOTEL_ADMIN o RECEPTIONIST)',
    description: 'Permite ajustar campos puntuales o estado de la habitación.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la habitación a modificar' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Habitación modificada exitosamente',
    type: Room,
  })
  async patch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoomDto: UpdateRoomDto,
    @CurrentUser() user: RequestUser,
  ): Promise<Room> {
    return await this.roomsService.update(id, updateRoomDto, user);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.HOTEL_ADMIN, Role.RECEPTIONIST)
  @Patch(':id/status')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Cambiar estado operativo de una habitación (HOTEL_ADMIN o RECEPTIONIST)',
    description:
      'Cambia rápidamente el estado entre AVAILABLE, OCCUPIED, MAINTENANCE o INACTIVE.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la habitación' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado operativo actualizado exitosamente',
    type: Room,
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusDto: UpdateRoomStatusDto,
    @CurrentUser() user: RequestUser,
  ): Promise<Room> {
    return await this.roomsService.updateStatus(id, statusDto.status, user);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Dar de baja o eliminar una habitación del inventario (Solo HOTEL_ADMIN)',
    description:
      'Por defecto realiza baja lógica (isActive: false, status: INACTIVE). Con ?force=true elimina el registro permanentemente.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la habitación' })
  @ApiQuery({
    name: 'force',
    required: false,
    description: 'Si es true, elimina permanentemente de la base de datos',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Habitación dada de baja exitosamente',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('force') force: string,
    @CurrentUser() user: RequestUser,
  ) {
    const isForce = force === 'true' || force === '1';
    return await this.roomsService.remove(id, isForce, user);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @Post('seed')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Poblar inventario con habitaciones iniciales de demostración (Solo HOTEL_ADMIN)',
    description:
      'Inserta habitaciones físicas y tipos de habitación vinculándolas automáticamente a los hoteles del catálogo.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Semilla de habitaciones ejecutada con éxito',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acceso denegado: Se requiere rol HOTEL_ADMIN',
  })
  async seed(@CurrentUser() user: RequestUser) {
    return await this.roomsService.seed(user?.id);
  }
}

