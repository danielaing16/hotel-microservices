import { ApiProperty } from '@nestjs/swagger';

export class PriceQuoteBreakdownDto {
  @ApiProperty({ example: 5, description: 'Número de noches de la estancia' })
  nights: number;

  @ApiProperty({ example: 195.0, description: 'Tarifa base promedio por noche en USD' })
  basePricePerNight: number;

  @ApiProperty({ example: 975.0, description: 'Subtotal base (noches * tarifa)' })
  subtotal: number;

  @ApiProperty({ example: 35.0, description: 'Recargos por fines de semana o alta temporada' })
  surcharges: number;

  @ApiProperty({ example: 1010.0, description: 'Costo total calculado' })
  totalAmount: number;

  @ApiProperty({ example: 'USD', description: 'Moneda' })
  currency: string;
}

export class AvailableRoomItemDto {
  @ApiProperty({ example: 'c7f99120-51b2-4e82-9a11-72819f441a01' })
  id: string;

  @ApiProperty({ example: '304' })
  roomNumber: string;

  @ApiProperty({ example: 'Junior Suite Oceanfront con Jacuzzi' })
  name: string;

  @ApiProperty({ example: 'JUNIOR_SUITE' })
  roomType: string;

  @ApiProperty({ example: 3 })
  maxAdults: number;

  @ApiProperty({ example: 2 })
  maxChildren: number;

  @ApiProperty({ example: '1 Cama King + 1 Sofá Cama' })
  bedType: string;

  @ApiProperty({ example: 58 })
  sizeSqm: number;

  @ApiProperty({ example: 'Vista al Mar' })
  viewType: string;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty({ type: PriceQuoteBreakdownDto })
  quote: PriceQuoteBreakdownDto;
}

