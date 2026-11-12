import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../common/enums/payment-method.enum';

export class ProcessPaymentDto {
  @ApiProperty({
    example: '25413547-d07a-49b0-ac0b-7361b930c033',
    description: 'UUID de la reserva en estado PENDING_PAYMENT',
  })
  @IsString()
  @IsNotEmpty({ message: 'El bookingId es obligatorio' })
  bookingId: string;

  @ApiProperty({
    example: 'idemp_key_98a7bc62d1e0',
    description: 'Llave de idempotencia única para prevenir cobros dobles',
  })
  @IsString()
  @IsNotEmpty({ message: 'La llave de idempotencia (idempotencyKey) es obligatoria' })
  idempotencyKey: string;

  @ApiProperty({
    example: 585.0,
    description: 'Monto total a cobrar (debe coincidir con el total de la reserva)',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({
    example: 'USD',
    default: 'USD',
    description: 'Código ISO de la moneda',
  })
  @IsOptional()
  @IsString()
  currency?: string = 'USD';

  @ApiPropertyOptional({
    enum: PaymentMethod,
    default: PaymentMethod.CREDIT_CARD,
    description: 'Método de pago seleccionado',
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod = PaymentMethod.CREDIT_CARD;

  @ApiPropertyOptional({
    example: '4242424242424242',
    description: 'Número de tarjeta (Stripe Sandbox / Mock)',
  })
  @IsOptional()
  @IsString()
  cardNumber?: string;

  @ApiPropertyOptional({
    example: 'Carlos Valderrama',
    description: 'Titular de la tarjeta bancaria',
  })
  @IsOptional()
  @IsString()
  cardHolderName?: string;

  @ApiPropertyOptional({
    example: '12/28',
    description: 'Fecha de expiración MM/YY',
  })
  @IsOptional()
  @IsString()
  cardExp?: string;

  @ApiPropertyOptional({
    example: '123',
    description: 'Código de seguridad CVC / CVV',
  })
  @IsOptional()
  @IsString()
  cardCvc?: string;

  @ApiPropertyOptional({
    example: 'TRF-BANCOLOMBIA-98124',
    description: 'Referencia o número de comprobante de transferencia bancaria',
  })
  @IsOptional()
  @IsString()
  transferReference?: string;
}

