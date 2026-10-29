import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject } from 'class-validator';
import { NotificationType } from '../../common/enums/notification-type.enum';

export class DispatchTestEventDto {
  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.BOOKING_CONFIRMATION,
    description: 'Tipo de notificación a disparar en el worker',
  })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @ApiProperty({
    example: {
      bookingId: 'bkg_demo_123',
      bookingReference: 'TR-DEMO-2026',
      userEmail: 'huesped@hotel-cloud.com',
      userName: 'Carlos Santana',
      hotelName: 'The Palm Luxury Suites',
      hotelAddress: 'Calle 50 # 12-40',
      hotelCity: 'Cartagena de Indias',
      roomTypeName: 'Master Ocean Suite',
      checkInDate: '2026-12-01',
      checkOutDate: '2026-12-05',
      nights: 4,
      guestsCount: 2,
      totalAmount: 820.0,
      currency: 'USD',
    },
    description: 'Payload del evento a despachar',
  })
  @IsObject()
  @IsNotEmpty()
  payload: any;
}

