import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class RefundEventDto {
  @ApiProperty({ example: 'bkg_9a87d654-e321-4b10-8901-abcdef123456' })
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({ example: 'TR-2026-X89J2K' })
  @IsString()
  @IsNotEmpty()
  bookingReference: string;

  @ApiProperty({ example: 're_3Nk827102910kd' })
  @IsString()
  @IsNotEmpty()
  refundId: string;

  @ApiProperty({ example: 'mauricio@hotel-dev.com' })
  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

  @ApiProperty({ example: 'Mauricio Gómez' })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({ example: 'Grand Luxury Resort & Spa' })
  @IsString()
  @IsNotEmpty()
  hotelName: string;

  @ApiProperty({ example: 'Suite Presidencial Vista al Mar' })
  @IsString()
  @IsNotEmpty()
  roomTypeName: string;

  @ApiProperty({ example: 450.0 })
  @IsNumber()
  refundAmount: number;

  @ApiProperty({ example: 450.0 })
  @IsNumber()
  originalAmount: number;

  @ApiProperty({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'Cancelación voluntaria dentro de la ventana de cancelación gratuita', required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ example: 'http://localhost', required: false })
  @IsOptional()
  @IsString()
  portalUrl?: string;
}

