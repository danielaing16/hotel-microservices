import { ApiProperty } from '@nestjs/swagger';
import { Room } from '../entities/room.entity';

export class PaginatedRoomsResponseDto {
  @ApiProperty({ type: [Room], description: 'Listado de habitaciones' })
  data: Room[];

  @ApiProperty({ example: 18, description: 'Total de habitaciones que coinciden con los filtros' })
  total: number;

  @ApiProperty({ example: 1, description: 'Página actual' })
  page: number;

  @ApiProperty({ example: 24, description: 'Cantidad máxima por página' })
  limit: number;

  @ApiProperty({ example: 1, description: 'Total de páginas disponibles' })
  totalPages: number;
}

