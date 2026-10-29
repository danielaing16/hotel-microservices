import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class BookingConfirmedEventDto {
  @ApiProperty({ example: 'bkg_9a87d654-e321-4b10-8901-abcdef123456', description: 'UUID de la reserva' })
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({ example: 'TR-2026-X89J2K', description: 'Código amigable de reserva' })
  @IsString()
  @IsNotEmpty()
  bookingReference: string;

  @ApiProperty({ example: 'mauricio@hotel-dev.com', description: 'Correo del huésped' })
  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

  @ApiProperty({ example: 'Mauricio Gómez', description: 'Nombre completo del huésped' })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({ example: '+57 300 123 4567', required: false })
  @IsOptional()
  @IsString()
  userPhone?: string;

  @ApiProperty({ example: 'Grand Luxury Resort & Spa', description: 'Nombre del hotel' })
  @IsString()
  @IsNotEmpty()
  hotelName: string;

  @ApiProperty({ example: 'Av. Costanera 1040', description: 'Dirección física del hotel' })
  @IsString()
  @IsNotEmpty()
  hotelAddress: string;

  @ApiProperty({ example: 'Cancún, México', description: 'Ciudad o destino' })
  @IsString()
  @IsNotEmpty()
  hotelCity: string;

  @ApiProperty({ example: 'Suite Presidencial Vista al Mar', description: 'Tipo de habitación' })
  @IsString()
  @IsNotEmpty()
  roomTypeName: string;

  @ApiProperty({ example: '2026-11-15', description: 'Fecha de llegada (Check-in)' })
  @IsString()
  @IsNotEmpty()
  checkInDate: string;

  @ApiProperty({ example: '2026-11-20', description: 'Fecha de salida (Check-out)' })
  @IsString()
  @IsNotEmpty()
  checkOutDate: string;

  @ApiProperty({ example: '15:00', required: false })
  @IsOptional()
  @IsString()
  checkInTime?: string;

  @ApiProperty({ example: '11:00', required: false })
  @IsOptional()
  @IsString()
  checkOutTime?: string;

  @ApiProperty({ example: 5, description: 'Número total de noches' })
  @IsNumber()
  @Min(1)
  nights: number;

  @ApiProperty({ example: 2, description: 'Cantidad de huéspedes' })
  @IsNumber()
  @Min(1)
  guestsCount: number;

  @ApiProperty({ example: 450.0, description: 'Monto total pagado' })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'ch_3Nkd8921Kjd982K', required: false })
  @IsOptional()
  @IsString()
  paymentId?: string;

  @ApiProperty({ example: 'Tarjeta Visa terminada en 4242', required: false })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({ example: 'Piso alto, cama king, almohadas de pluma', required: false })
  @IsOptional()
  @IsString()
  specialRequests?: string;

  @ApiProperty({ example: 'http://localhost', required: false })
  @IsOptional()
  @IsString()
  dashboardUrl?: string;
}

