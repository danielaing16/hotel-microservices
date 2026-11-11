import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoomStatus } from '../../common/enums/room-status.enum';

export class UpdateRoomStatusDto {
  @ApiProperty({
    enum: RoomStatus,
    example: RoomStatus.MAINTENANCE,
    description: 'Nuevo estado operativo de la habitación (AVAILABLE, OCCUPIED, MAINTENANCE, INACTIVE)',
  })
  @IsNotEmpty({ message: 'El estado de la habitación es obligatorio' })
  @IsEnum(RoomStatus, {
    message: 'Estado inválido. Valores permitidos: AVAILABLE, OCCUPIED, MAINTENANCE, INACTIVE',
  })
  status: RoomStatus;
}

