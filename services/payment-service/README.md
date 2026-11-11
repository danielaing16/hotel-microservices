# Microservicio de Pagos y Transacciones (Payment Service)

Microservicio financiero de alta resiliencia encargado del procesamiento transaccional de pagos, gestión de idempotencia, reembolsos y webhooks. Desarrollado con **NestJS**, **TypeORM**, **PostgreSQL** y **RabbitMQ**.

## 🚀 Características Principales

1. **Idempotencia Garantizada:** Llaves únicas (`idempotencyKey`) que impiden cobros duplicados en caso de reintentos del cliente o latencia de red.
2. **Event-Driven Architecture (RabbitMQ):**
   - Emite: `payment.succeeded`, `payment.failed`, `payment.refunded`.
   - Coordina automáticamente la confirmación de reservas en `booking-service` y la liberación/fijación en `availability-service`.
3. **Simulador de Pasarela Transaccional (Stripe Sandbox / Mock):**
   - Validación de tarjetas de crédito/débito.
   - Emisión de recibos y códigos de referencia (`tx_stripe_...`).
4. **Control de Acceso Basado en Roles (RBAC):**
   - Huésped: efectúa pagos y consulta sus comprobantes.
   - Administrador: consulta métricas globales y procesa reembolsos.

