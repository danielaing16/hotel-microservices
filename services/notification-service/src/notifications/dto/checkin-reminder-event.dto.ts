import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CheckinReminderEventDto {
  @ApiProperty({ example: 'bkg_9a87d654-e321-4b10-8901-abcdef123456' })
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({ example: 'TR-2026-X89J2K' })
  @IsString()
  @IsNotEmpty()
  bookingReference: string;

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

  @ApiProperty({ example: 'Av. Costanera 1040' })
  @IsString()
  @IsNotEmpty()
  hotelAddress: string;

  @ApiProperty({ example: 'Cancún, México' })
  @IsString()
  @IsNotEmpty()
  hotelCity: string;

  @ApiProperty({ example: 'Suite Presidencial Vista al Mar' })
  @IsString()
  @IsNotEmpty()
  roomTypeName: string;

  @ApiProperty({ example: '2026-11-15' })
  @IsString()
  @IsNotEmpty()
  checkInDate: string;

  @ApiProperty({ example: '15:00', required: false })
  @IsOptional()
  @IsString()
  checkInTime?: string;

  @ApiProperty({ example: 'Servicio de traslado gratuito disponible desde el aeropuerto.', required: false })
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @ApiProperty({ example: 'http://localhost', required: false })
  @IsOptional()
  @IsString()
  portalUrl?: string;
}

