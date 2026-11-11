import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '../../common/enums/payment-status.enum';

export class QueryPaymentsDto {
  @ApiPropertyOptional({
    description: 'Filtrar por estado del pago',
    enum: PaymentStatus,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Buscar por referencia de transacción, bookingCode o email de usuario',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    default: 1,
    description: 'Número de página',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    default: 20,
    description: 'Límite de elementos por página',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

