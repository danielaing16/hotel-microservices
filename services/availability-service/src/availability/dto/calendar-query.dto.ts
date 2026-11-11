import { IsInt, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CalendarQueryDto {
  @ApiPropertyOptional({
    example: 2026,
    description: 'Año a consultar (por defecto año actual)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2024)
  @Max(2035)
  year?: number;

  @ApiPropertyOptional({
    example: 11,
    description: 'Mes a consultar (1 a 12, por defecto mes actual)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;
}

