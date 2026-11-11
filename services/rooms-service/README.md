# 🛏️ Microservicio de Habitaciones e Inventario (`rooms-service`)

Microservicio responsable de la **administración de tipos de habitación, inventario físico por hotel, capacidades de ocupación, tarifas base por noche y estados de mantenimiento** dentro de la plataforma cloud-native de reservas hoteleras.

---

## 📌 Responsabilidades

1. **Tipos y Categorías de Habitación (`RoomTypeCategory`):**
   - `STANDARD`, `DELUXE`, `JUNIOR_SUITE`, `PRESIDENTIAL_SUITE`, `PENTHOUSE`.
   - Superficie en metros cuadrados (`sizeSqm`), orientación/vista (`viewType`) y configuración de camas (`bedType`, `bedsCount`).

2. **Inventario Físico por Sede Hotelera:**
   - Vinculación directa con `hotels-service` mediante `hotelId` y `hotelSlug`.
   - Número de habitación (`roomNumber`), piso (`floor`) y galería fotográfica.
   - Capacidades máximas de ocupación (`maxAdults`, `maxChildren`).
   - Tarifas base en USD (`pricePerNight`) y en centavos (`basePriceCents`) para precisión transaccional.

3. **Estados Operativos y Control RBAC:**
   - Estados: `AVAILABLE`, `OCCUPIED`, `MAINTENANCE`, `INACTIVE`.
   - **Lectura Pública:** Consulta del catálogo general, resumen de tipos y habitaciones por hotel.
   - **Administración (`HOTEL_ADMIN`):** Creación, actualización integral y baja de habitaciones.
   - **Operación de Recepción (`RECEPTIONIST` / `HOTEL_ADMIN`):** Cambio rápido de estado operativo (`MAINTENANCE`, `AVAILABLE`, `OCCUPIED`).

---

## 🚀 Endpoints de la API (`/api/rooms`)

| Método | Endpoint | Acceso (RBAC) | Descripción |
|---|---|---|---|
| `GET` | `/api/rooms` | Público | Lista habitaciones con filtros (`hotelId`, `roomType`, `status`, `minPrice`, `maxPrice`, `minAdults`, `search`). |
| `GET` | `/api/rooms/types` | Público | Resumen estadístico agrupado por categoría de habitación. |
| `GET` | `/api/rooms/hotel/:hotelId` | Público | Lista el inventario de habitaciones de un hotel específico (UUID o slug). |
| `GET` | `/api/rooms/:id` | Público | Obtiene el detalle completo de una habitación por UUID. |
| `POST` | `/api/rooms` | `HOTEL_ADMIN` | Registra una nueva habitación en el inventario de un hotel. |
| `PUT` | `/api/rooms/:id` | `HOTEL_ADMIN` | Actualiza completamente los datos de una habitación. |
| `PATCH` | `/api/rooms/:id` | `HOTEL_ADMIN`, `RECEPTIONIST` | Modifica parcialmente campos de una habitación. |
| `PATCH` | `/api/rooms/:id/status` | `HOTEL_ADMIN`, `RECEPTIONIST` | Cambia el estado operativo (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`, `INACTIVE`). |
| `DELETE` | `/api/rooms/:id` | `HOTEL_ADMIN` | Da de baja una habitación (*soft-delete* o permanente con `?force=true`). |
| `POST` | `/api/rooms/seed` | Desarrollo | Puebla el inventario con habitaciones de demostración sincronizadas con los hoteles. |

---

## 📖 Documentación Swagger / OpenAPI

```
http://localhost:3003/api/docs
```

