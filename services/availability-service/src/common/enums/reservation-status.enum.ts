export enum ReservationStatus {
  HOLD = 'HOLD',                         // Bloqueo temporal de 10 min en proceso de checkout
  CONFIRMED = 'CONFIRMED',               // Reserva confirmada y pagada
  CANCELLED = 'CANCELLED',               // Cancelada por el usuario o compensación Saga
  RELEASED = 'RELEASED',                 // Bloqueo liberado (por timeout o usuario)
}

