# 📅 Microservicio de Disponibilidad y Bloqueos (`availability-service`)

Microservicio central de alto rendimiento encargado de la **búsqueda de disponibilidad en tiempo real**, **cotización dinámica de tarifas**, **bloqueos temporales anti-overbooking (Redis Soft-Locks / Holds de 10 min)** y **calendarios mensuales de ocupación** para la plataforma hotelera cloud-native.

---

## 📌 Responsabilidades

1. **Búsqueda Dinámica de Disponibilidad:**
   - Cruza el catálogo de habitaciones (`rooms-service`) contra reservas en PostgreSQL y bloqueos activos en Redis para el intervalo de fechas `[checkIn, checkOut)`.
   - Aplica filtros de capacidad de adultos y niños.
   - Computa la cotización con desglose de noches y recargo dinámico del 15% para fines de semana (viernes y sábado).

2. **Estrategia Anti-Overbooking Multicapa:**
   - **Capa Redis (Redlock / Soft-Lock):** Bloqueo atómico por noches mediante script Lua con expiración automática (TTL 10 min).
   - **Capa PostgreSQL:** Registro de bloqueo transaccional (`status: 'HOLD'`) con comprobación de solapamiento `(checkIn < new_checkOut) AND (checkOut > new_checkIn)`.

3. **Calendario Mensual de Habitación:**
   - Genera el estado día a día para cualquier mes y año (`AVAILABLE`, `HOLD`, `BOOKED`).

4. **Integración con Eventos (RabbitMQ):**
   - Consume `payment.succeeded`: promueve el hold temporal a reserva confirmada (`CONFIRMED`).
   - Consume `payment.failed` / `booking.cancelled`: libera inmediatamente el hold en Redis y PostgreSQL.

---

## 🚀 Endpoints REST (`/api/availability`)

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/availability/search` | Público | Busca habitaciones disponibles dado `hotelId`, `checkIn`, `checkOut`, `adults`, `children`. |
| `POST` | `/api/availability/hold` | Autenticado | Genera un bloqueo temporal de 10 minutos para iniciar checkout bancario. |
| `POST` | `/api/availability/release` | Autenticado | Libera anticipadamente un bloqueo temporal. |
| `GET` | `/api/availability/calendar/:roomId` | Público | Retorna el calendario mensual de ocupación día por día. |
| `POST` | `/api/availability/seed` | `HOTEL_ADMIN` | Puebla datos iniciales de demostración. |

---

## 📖 Documentación Swagger UI

```
http://localhost:3004/api/docs
```
O a través del API Gateway:
```
http://localhost:3000/docs
```

