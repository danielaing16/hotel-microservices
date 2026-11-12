import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ModifyBookingDto {
  @ApiPropertyOptional({ example: 'Carlos Gómez' })
  @IsOptional()
  @IsString()
  userName?: string;

  @ApiPropertyOptional({ example: '+57 300 987 6543' })
  @IsOptional()
  @IsString()
  userPhone?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  guestsCount?: number;

  @ApiPropertyOptional({ example: 'Cama extra para niño y habitación en piso alto' })
  @IsOptional()
  @IsString()
  specialRequests?: string;
}

