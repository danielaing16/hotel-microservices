import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PaymentFailedEventDto {
  @ApiProperty({ example: 'bkg_9a87d654-e321-4b10-8901-abcdef123456' })
  @IsString()
  @IsNotEmpty()
  bookingId: string;

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
  totalAmount: number;

  @ApiProperty({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'Fondos insuficientes (card_declined) en Stripe' })
  @IsString()
  @IsNotEmpty()
  failureReason: string;

  @ApiProperty({ example: 'http://localhost/checkout?retry=bkg_9a87', required: false })
  @IsOptional()
  @IsString()
  retryPaymentUrl?: string;

  @ApiProperty({ example: '10 minutos restantes de reserva en Redis', required: false })
  @IsOptional()
  @IsString()
  expiresAt?: string;
}

