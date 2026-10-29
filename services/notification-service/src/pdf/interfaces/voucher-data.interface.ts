export interface VoucherData {
  bookingId: string;
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  hotelName: string;
  hotelAddress: string;
  hotelCity: string;
  roomTypeName: string;
  checkInDate: string;
  checkOutDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  nights: number;
  guestsCount: number;
  totalAmount: number;
  currency?: string;
  paymentId?: string;
  paymentMethod?: string;
  status?: string;
  specialRequests?: string;
  qrPayload?: string;
}

