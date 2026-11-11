# Microservicio de Reservas (Booking Service)

Microservicio empresarial encargado de la gestión integral y orquestación del ciclo de vida de las reservas de habitación de hotel. Desarrollado con **NestJS**, **TypeORM**, **PostgreSQL** y **RabbitMQ**.

## 🚀 Características Principales

1. **Orquestación del Ciclo de Vida:**
   - `PENDING_PAYMENT`: Reserva iniciada, pendiente de checkout bancario.
   - `CONFIRMED`: Pago acreditado satisfactoriamente.
   - `CANCELLED`: Cancelada por usuario o compensación Saga.
   - `CHECKED_IN`: Huésped verificado físicamente en recepción.
   - `COMPLETED`: Estancia finalizada satisfactoriamente.
2. **Generación de Código Único de Reserva:** Códigos legibles (ej: `TR-2026-X8F9Q`).
3. **Integración con Availability Service:** Coordina los bloqueos temporales de inventario (*holds* de 10 min) para garantizar anti-overbooking.
4. **Event-Driven Architecture (RabbitMQ):**
   - Emite: `booking.created`, `booking.confirmed`, `booking.cancelled`.
   - Consume: `payment.succeeded`, `payment.failed`.
5. **Control de Acceso Basado en Roles (RBAC):**
   - Huésped: gestiona sus propias reservas (`/api/bookings/my-bookings`).
   - Recepcionista / Administrador: gestiona check-ins, cancelaciones y búsqueda global.

