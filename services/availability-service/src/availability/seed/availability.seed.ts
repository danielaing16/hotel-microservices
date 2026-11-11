import { ReservationStatus } from '../../common/enums/reservation-status.enum';

export const INITIAL_AVAILABILITY_SEED = [
  {
    holdId: 'seed_confirmed_101',
    roomId: 'room_seed_cartagena_201',
    roomNumber: '201',
    hotelId: 'cartagena-luxury-beach-spa-resort',
    userId: 'usr_guest_demo_01',
    checkIn: '2026-11-15',
    checkOut: '2026-11-18',
    status: ReservationStatus.CONFIRMED,
    totalAmount: 585.0,
    currency: 'USD',
    guestsCount: 2,
    bookingReference: 'TR-2026-CTGB01',
  },
  {
    holdId: 'seed_confirmed_102',
    roomId: 'room_seed_cartagena_405',
    roomNumber: '405',
    hotelId: 'cartagena-luxury-beach-spa-resort',
    userId: 'usr_guest_demo_02',
    checkIn: '2026-11-26',
    checkOut: '2026-11-30',
    status: ReservationStatus.CONFIRMED,
    totalAmount: 1160.0,
    currency: 'USD',
    guestsCount: 3,
    bookingReference: 'TR-2026-CTGB02',
  },
];

