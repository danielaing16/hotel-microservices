import { ApiProperty } from '@nestjs/swagger';
import { NotificationStatus, NotificationType } from '../../common/enums/notification-type.enum';

export class NotificationLogEntryDto {
  @ApiProperty({ example: 'notif_1730000000_abc' })
  id: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.BOOKING_CONFIRMATION })
  type: NotificationType;

  @ApiProperty({ example: 'mauricio@hotel-dev.com' })
  recipient: string;

  @ApiProperty({ example: '🏨 Confirmación de Reserva [TR-2026-X89J2K]' })
  subject: string;

  @ApiProperty({ enum: NotificationStatus, example: NotificationStatus.SENT })
  status: NotificationStatus;

  @ApiProperty({ example: '2026-10-28T19:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: 125, description: 'Tiempo de procesamiento en ms' })
  durationMs: number;

  @ApiProperty({ example: true, description: 'Si incluyó archivo adjunto PDF' })
  hasAttachment: boolean;

  @ApiProperty({ example: 'https://ethereal.email/message/WaQK6...', required: false })
  previewUrl?: string;

  @ApiProperty({ required: false })
  error?: string;
}

