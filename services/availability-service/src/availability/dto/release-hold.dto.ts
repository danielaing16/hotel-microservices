import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReleaseHoldDto {
  @ApiProperty({
    example: 'hold_9b2d63d_a233',
    description: 'Identificador del hold a liberar',
  })
  @IsString()
  @IsNotEmpty({ message: 'El holdId es obligatorio' })
  holdId: string;
}

