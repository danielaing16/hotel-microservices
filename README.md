# 🏨 Plataforma Cloud-Native de Microservicios para Gestión y Reservas Hoteleras

> **Documento Oficial de Arquitectura del Sistema, Especificación de Microservicios y Guía de Implementación Técnica.**

---

## 📑 Tabla de Contenidos

1. [Visión General del Sistema](#-visión-general-del-sistema)
2. [Arquitectura Global de la Solución](#-arquitectura-global-de-la-solución)
   - [Diagrama de Arquitectura de Alto Nivel](#diagrama-de-arquitectura-de-alto-nivel)
   - [Principios de Diseño y Patrones Arquitectónicos](#principios-de-diseño-y-patrones-arquitectónicos)
3. [Catálogo Exhaustivo de Microservicios](#-catálogo-exhaustivo-de-microservicios)
   - [1. API Gateway Unificado](#1-api-gateway-unificado)
   - [2. Microservicio de Usuarios y Autenticación (Auth Service)](#2-microservicio-de-usuarios-y-autenticación-auth-service)
   - [3. Microservicio de Hoteles (Hotels Service)](#3-microservicio-de-hoteles-hotels-service)
   - [4. Microservicio de Habitaciones (Rooms Service)](#4-microservicio-de-habitaciones-rooms-service)
   - [5. Microservicio de Disponibilidad e Inventario (Availability Service)](#5-microservicio-de-disponibilidad-e-inventario-availability-service)
   - [6. Microservicio de Reservas (Bookings Service - Orquestador)](#6-microservicio-de-reservas-bookings-service---orquestador)
   - [7. Microservicio de Pagos y Transacciones (Payments Service)](#7-microservicio-de-pagos-y-transacciones-payments-service)
   - [8. Microservicio de Notificaciones (Notifications Service)](#8-microservicio-de-notificaciones-notifications-service)
   - [9. Microservicio de Reseñas y Calificaciones (Reviews Service - Complementario)](#9-microservicio-de-reseñas-y-calificaciones-reviews-service---complementario)
   - [10. Microservicio de Analítica y Reportes (Analytics Service - Complementario)](#10-microservicio-de-analítica-y-reportes-analytics-service---complementario)
4. [Flujos de Negocio y Patrón Saga](#-flujos-de-negocio-y-patrón-saga)
   - [Flujo de Reserva Exitoso (Happy Path)](#flujo-de-reserva-exitoso-happy-path)
   - [Flujo Compensatorio por Pago Fallido o Expiración](#flujo-compensatorio-por-pago-fallido-o-expiración)
5. [Estrategia Técnica Anti-Overbooking](#-estrategia-técnica-anti-overbooking)
6. [Estructura del Proyecto (Monorepo)](#-estructura-del-proyecto-monorepo)
7. [Matriz de Puertos y Variables de Entorno](#-matriz-de-puertos-y-variables-de-entorno)
8. [Guía de Ejecución y Puesta en Marcha](#-guía-de-ejecución-y-puesta-en-marcha)

---

## 📌 Visión General del Sistema

La **Plataforma de Gestión y Reservas Hoteleras** es un ecosistema distribuido, altamente desacoplado y orientado a eventos (*Event-Driven Architecture*), diseñado para resolver los desafíos críticos del sector hotelero:
- **Búsqueda y consulta de disponibilidad** en tiempo real con latencias menores a 50ms mediante caché distribuida.
- **Prevención estricta de sobreventa (anti-overbooking)** utilizando bloqueos temporales distribuidos (*distributed hold/locks*) y restricciones de exclusión espacial/temporal en base de datos.
- **Orquestación transaccional distribuida** para reservas y pagos mediante el **Patrón Saga** sin bloqueos bidireccionales rígidos (Two-Phase Commit).
- **Seguridad centralizada basada en Claims y RBAC** (Role-Based Access Control) con JSON Web Tokens (JWT).
- **Procesamiento asíncrono y resiliente** de facturación, pasarelas de pago y notificaciones con vouchers en PDF y códigos QR.

---

## 🏛 Arquitectura Global de la Solución

### Diagrama de Arquitectura de Alto Nivel

```mermaid
graph TB
    subgraph "Clientes Externos"
        ClientWeb["💻 Frontend SPA (HTML5 / Vanilla JS / Nginx)"]
        ClientMobile["📱 App Móvil / Clientes API"]
    end

    subgraph "Capa Perimetral & Seguridad"
        Gateway["🚪 API Gateway (NestJS)\nPuerto: 3000\n- Reverse Proxy Dinámico\n- Rate Limiting (Throttler)\n- Validación JWT Central\n- Inyección Headers (x-user-id, x-user-role)"]
    end

    subgraph "Capa de Microservicios Core (Backend)"
        AuthMS["🔐 Auth Service\nPuerto: 3001\nNestJS + TypeORM\nPostgreSQL (hotel_auth_db)"]
        HotelMS["🏨 Hotels Service\nPuerto: 3002\nNestJS + TypeORM\nPostgreSQL (hotel_hotels_db)"]
        RoomMS["🛏️ Rooms Service\nPuerto: 3003\nNestJS + TypeORM\nPostgreSQL (hotel_rooms_db)"]
        AvailMS["📅 Availability Service\nPuerto: 3004\nNestJS + PostgreSQL + Redis\nBloqueos Distribuidos"]
        BookingMS["📝 Bookings Service\nPuerto: 3005\nNestJS + Saga Orchestrator\nPostgreSQL (hotel_booking_db)"]
        PaymentMS["💳 Payments Service\nPuerto: 3006\nNestJS + Pasarela / Stripe SDK\nPostgreSQL (hotel_payment_db)"]
    end

    subgraph "Broker de Eventos & Asincronismo"
        RabbitMQ["📨 RabbitMQ (Message Broker)\nPuerto: 5672 / 15672 UI\nExchange: hotel.events.topic"]
    end

    subgraph "Servicios Asíncronos & Complementarios"
        NotifMS["🔔 Notifications Service\nWorker Asíncrono\nNodemailer + PDFKit (QR Voucher)"]
        ReviewMS["⭐ Reviews Service\nPuerto: 3007\nNestJS + MongoDB (hotel_reviews_db)"]
        AnalyticsMS["📊 Analytics Service\nPuerto: 3008\nCálculo métricas RevPAR & ADR"]
    end

    ClientWeb -->|HTTP / REST| Gateway
    ClientMobile -->|HTTP / REST| Gateway

    Gateway -->|/api/auth/*| AuthMS
    Gateway -->|/api/hotels/*| HotelMS
    Gateway -->|/api/rooms/*| RoomMS
    Gateway -->|/api/availability/*| AvailMS
    Gateway -->|/api/bookings/*| BookingMS
    Gateway -->|/api/payments/*| PaymentMS
    Gateway -->|/api/reviews/*| ReviewMS
    Gateway -->|/api/analytics/*| AnalyticsMS

    BookingMS -.->|Event: BookingCreated| RabbitMQ
    PaymentMS -.->|Event: PaymentProcessed / Failed| RabbitMQ
    RabbitMQ -.->|Consume: PaymentSuccess| BookingMS
    RabbitMQ -.->|Consume: PaymentSuccess| AvailMS
    RabbitMQ -.->|Consume: PaymentSuccess| NotifMS
    RabbitMQ -.->|Consume: PaymentFailed| BookingMS
    RabbitMQ -.->|Consume: PaymentFailed| AvailMS
```

### Principios de Diseño y Patrones Arquitectónicos

1. **Database per Service:** Cada microservicio posee su propia instancia o base de datos lógica dedicada. Ningún servicio accede directamente a las tablas de otro; toda comunicación interservicios se realiza mediante APIs REST enriquecidas o mensajería asíncrona.
2. **API Gateway Pattern:** Oculta la topología interna de la red de contenedores, unifica las políticas CORS, aplica *rate limiting* para mitigación de ataques DoS y decodifica la identidad del usuario agregando encabezados HTTP (`x-user-id`, `x-user-email`, `x-user-role`).
3. **Event-Driven Architecture (EDA):** Comunicación no bloqueante mediante eventos publicados en RabbitMQ para notificaciones, confirmaciones de inventario y reconciliación de pagos.
4. **Patrón Saga (Orquestación):** Coordinación de pasos con compensación automática. Si una transacción downstream (e.g. cobro) falla, se emite una transacción de compensación para liberar el inventario bloqueado.
5. **CQRS Ligero:** Consultas de disponibilidad optimizadas en memoria con Redis (Query) vs. mutaciones de estado transaccionales protegidas por bases de datos relacionales ACID (Command).
6. **Graceful Degradation & Circuit Breaking:** Si un servicio downstream (ej. Notificaciones) no responde, la reserva se procesa de forma satisfactoria y los correos se reintentan mediante colas de mensajes muertos (Dead Letter Queues - DLQ).

---

## 🧩 Catálogo Exhaustivo de Microservicios

---

### 1. API Gateway Unificado

- **Directorio:** `gateway/`
- **Puerto:** `3000`
- **Tecnología:** NestJS, `@nestjs/jwt`, `@nestjs/throttler`, `http-proxy-middleware`.
- **Base de Datos:** Ninguna (Stateless).

#### Responsabilidades:
1. Punto único de entrada seguro para aplicaciones frontend y clientes terceros.
2. Proxy inverso dinámico hacia los microservicios downstream según el prefijo de ruta.
3. Validación de tokens JWT en el borde (*Edge Validation*) e inyección transparente de cabeceras de identidad:
   - `x-user-id`: ID único del usuario autenticado.
   - `x-user-email`: Correo electrónico verificado.
   - `x-user-role`: Rol del usuario (`ADMIN`, `HOTEL_MANAGER`, `RECEPTIONIST`, `GUEST`).
4. Rate limiting global (100 peticiones por minuto por IP por defecto).
5. Manejo unificado de caídas downstream retornando `503 Service Unavailable` con mensaje estructurado amigable.

#### Enrutamiento de Rutas:
| Ruta Solicitada | Servicio Destino | Propósito |
|---|---|---|
| `/api/auth/*` | `http://auth-service:3001` | Registro, login, perfiles y usuarios |
| `/api/hotels/*` | `http://hotels-service:3002` | Catálogo de hoteles, sedes y amenidades |
| `/api/rooms/*` | `http://rooms-service:3003` | Inventario base de habitaciones y tipos |
| `/api/availability/*` | `http://availability-service:3004` | Consulta de fechas libres y bloqueos temporales |
| `/api/bookings/*` | `http://booking-service:3005` | Ciclo de vida y orquestación de reservas |
| `/api/payments/*` | `http://payment-service:3006` | Procesamiento de checkout y webhooks |
| `/health` | Interno (Gateway) | Chequeo de salud del API Gateway |

---

### 2. Microservicio de Usuarios y Autenticación (Auth Service)

- **Directorio:** `services/auth-service/`
- **Puerto:** `3001`
- **Tecnología:** NestJS, TypeORM, Passport JWT, BCrypt.
- **Base de Datos:** PostgreSQL (`hotel_auth_db`).

#### Responsabilidades:
1. Registro seguro de usuarios y huéspedes.
2. Autenticación con credenciales (email y password con hash BCrypt, salt rounds = 10).
3. Emisión de tokens de acceso JWT firmados criptográficamente.
4. Gestión de perfiles, listado de usuarios y asignación de roles jerárquicos:
   - `GUEST`: Huésped estándar (consultar y reservar sus propias estancias).
   - `RECEPTIONIST`: Personal de recepción (ver reservas del día, check-in/out).
   - `HOTEL_MANAGER`: Gerente de hotel (administrar hoteles, habitaciones y tarifas).
   - `ADMIN`: Superadministrador con privilegios globales.

#### Modelo de Datos Principal (`users`):
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(30) DEFAULT 'GUEST', -- 'GUEST', 'RECEPTIONIST', 'HOTEL_MANAGER', 'ADMIN'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Endpoints REST:
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/register` | Público | Registra una nueva cuenta de huésped |
| `POST` | `/api/auth/login` | Público | Autentica usuario y devuelve JWT + datos básicos |
| `GET` | `/api/auth/profile` | Autenticado | Devuelve los datos del usuario extraídos del token |
| `GET` | `/api/auth/users` | Admin / Manager | Lista todos los usuarios registrados (con paginación) |
| `PUT` | `/api/auth/users/:id` | Admin / Propietario | Actualiza información personal o roles |
| `GET` | `/api/auth/admin-only` | Admin | Endpoint protegido de verificación de rol privilegiado |

---

### 3. Microservicio de Hoteles (Hotels Service)

- **Directorio:** `services/hotels-service/`
- **Puerto:** `3002`
- **Tecnología:** NestJS, TypeORM / Prisma.
- **Base de Datos:** PostgreSQL (`hotel_hotels_db`).

#### Responsabilidades:
1. Catálogo maestro de hoteles y propiedades.
2. Gestión de sedes, coordenadas georreferenciadas (latitud, longitud, ciudad, país).
3. Políticas del establecimiento (horario de check-in/check-out, políticas de cancelación, mascotas, etc.).
4. Catálogo de amenidades generales (piscina climatizada, gimnasio, restaurante, parking, WiFi, etc.).

#### Modelo de Datos Principal:
- `hotels`: `id`, `name`, `slug`, `description`, `address`, `city`, `country`, `latitude`, `longitude`, `stars`, `check_in_time`, `check_out_time`, `created_at`.
- `hotel_amenities`: `id`, `hotel_id` (FK), `name`, `icon_key`, `is_free`.

#### Endpoints REST:
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/hotels` | Público | Lista hoteles con filtros por ciudad, estrellas y amenidades |
| `GET` | `/api/hotels/:id` | Público | Obtiene el detalle completo de un hotel y sus servicios |
| `POST` | `/api/hotels` | Admin / Manager | Crea un nuevo hotel en el sistema |
| `PUT` | `/api/hotels/:id` | Admin / Manager | Actualiza información, políticas o fotos del hotel |
| `DELETE` | `/api/hotels/:id` | Admin | Desactiva o elimina un hotel |

---

### 4. Microservicio de Habitaciones (Rooms Service)

- **Directorio:** `services/rooms-service/`
- **Puerto:** `3003`
- **Tecnología:** NestJS, TypeORM.
- **Base de Datos:** PostgreSQL (`hotel_rooms_db`).

#### Responsabilidades:
1. Administración de tipos de habitaciones (*Standard*, *Deluxe*, *Junior Suite*, *Presidential Suite*).
2. Registro de habitaciones físicas individuales (ej. Habitación 304, Piso 3).
3. Capacidades de ocupación: límite de adultos, niños, cantidad y tipo de camas.
4. Tarifas base por noche y galería de fotos (URLs hacia CDN / S3).

#### Modelo de Datos Principal:
- `room_types`: `id`, `hotel_id`, `name`, `description`, `base_price_cents`, `max_adults`, `max_children`, `size_sqm`.
- `rooms`: `id`, `hotel_id`, `room_type_id`, `room_number`, `floor`, `status` (`AVAILABLE`, `MAINTENANCE`, `INACTIVE`).

#### Endpoints REST:
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/rooms/hotel/:hotelId` | Público | Lista los tipos de habitación e inventario de un hotel |
| `GET` | `/api/rooms/:id` | Público | Detalle de una habitación específica |
| `POST` | `/api/rooms` | Admin / Manager | Registra una nueva habitación o tipo de habitación |
| `PUT` | `/api/rooms/:id` | Admin / Manager | Modifica tarifa base, amenidades o estado de mantenimiento |
| `DELETE` | `/api/rooms/:id` | Admin | Da de baja una habitación del inventario |

---

### 5. Microservicio de Disponibilidad e Inventario (Availability Service)

- **Directorio:** `services/availability-service/`
- **Puerto:** `3004`
- **Tecnología:** NestJS, Redis (Cache & Redlock), PostgreSQL (`hotel_availability_db`).
- **Base de Datos:** PostgreSQL + Redis.

#### Responsabilidades:
1. **Consulta ultra rápida de disponibilidad:** Algoritmo que cruza el inventario de habitaciones contra reservas existentes en un rango de fechas `[checkIn, checkOut)`.
2. **Bloqueo temporal de checkout (*Soft-Lock / Hold*):** Bloquea temporalmente una habitación por **10 a 15 minutos** mientras el usuario introduce sus datos bancarios para evitar que otro usuario la tome al mismo tiempo.
3. **Liberación automática por TTL:** Si el bloqueo no se confirma en el tiempo límite, expira automáticamente en Redis.
4. **Cálculo dinámico de cotizaciones:** Aplica recargos por fines de semana o temporadas si aplica.

#### Endpoints REST:
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/availability/search` | Público | Busca habitaciones disponibles dado `hotelId`, `checkIn`, `checkOut`, `adults`, `children` |
| `POST` | `/api/availability/hold` | Autenticado | Genera un bloqueo temporal (10 min) para iniciar checkout |
| `POST` | `/api/availability/release` | Autenticado / Interno | Libera un bloqueo temporal anticipadamente |
| `GET` | `/api/availability/calendar/:roomId` | Manager / Admin | Vista mensual del calendario de ocupación |

#### Eventos Asíncronos:
- **Consume:**
  - `PaymentCompleted`: Transforma el bloqueo temporal en reserva definitiva en la base de datos de disponibilidad.
  - `PaymentFailed` o `BookingCancelled`: Libera inmediatamente el bloqueo de fechas en Redis y base de datos.

---

### 6. Microservicio de Reservas (Bookings Service - Orquestador)

- **Directorio:** `services/booking-service/`
- **Puerto:** `3005`
- **Tecnología:** NestJS, TypeORM, RabbitMQ Client.
- **Base de Datos:** PostgreSQL (`hotel_booking_db`).

#### Responsabilidades:
1. **Orquestador del ciclo de vida de la reserva:** Estados:
   - `PENDING_PAYMENT`: Creada, esperando pago dentro de la ventana de tiempo.
   - `CONFIRMED`: Pagada con éxito y confirmada.
   - `CANCELLED`: Cancelada por usuario, falta de pago o compensación Saga.
   - `CHECKED_IN`: Huésped registrado en el hotel.
   - `COMPLETED`: Estancia finalizada satisfactoriamente.
2. Cálculo del costo total: `(noches * tarifa_noche) + impuestos - descuentos`.
3. Gestión del historial de reservas del usuario y vista de reservas para recepcionistas.
4. Generación de código único alfanumérico de reserva (ej. `HTL-2026-X8F9Q`).

#### Modelo de Datos Principal (`bookings`):
```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    hotel_id UUID NOT NULL,
    room_id UUID NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guests_count INT NOT NULL,
    total_amount_cents INT NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(30) DEFAULT 'PENDING_PAYMENT',
    payment_id UUID,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Endpoints REST:
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/api/bookings` | Huésped | Inicia una reserva y orquesta el bloqueo temporal |
| `GET` | `/api/bookings/my-bookings` | Huésped | Lista el historial de reservas del usuario en sesión |
| `GET` | `/api/bookings/:id` | Huésped / Personal | Detalle completo de una reserva por ID o código |
| `PATCH` | `/api/bookings/:id/cancel` | Huésped / Admin | Solicita cancelación y activa el proceso de reembolso |
| `PATCH` | `/api/bookings/:id/checkin` | Recepcionista / Admin | Marca el check-in físico del huésped en recepción |

---

### 7. Microservicio de Pagos y Transacciones (Payments Service)

- **Directorio:** `services/payment-service/`
- **Puerto:** `3006`
- **Tecnología:** NestJS, TypeORM, Stripe SDK / Mercado Pago SDK.
- **Base de Datos:** PostgreSQL (`hotel_payment_db`).

#### Responsabilidades:
1. Procesamiento transaccional de pagos mediante pasarelas reales o sandbox (Stripe PaymentIntents, PayPal, Mercado Pago).
2. Manejo de **Llaves de Idempotencia (*Idempotency Keys*)** para impedir cobros dobles si el cliente presiona el botón dos veces o hay fallas de red.
3. Recepción y validación criptográfica de **Webhooks** de la pasarela de pagos.
4. Procesamiento de reembolsos totales o parciales según la política de cancelación.

#### Modelo de Datos Principal (`payments`):
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL,
    user_id UUID NOT NULL,
    amount_cents INT NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    gateway_provider VARCHAR(50) NOT NULL, -- 'STRIPE', 'MERCADO_PAGO'
    transaction_reference VARCHAR(255) UNIQUE NOT NULL,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(30) NOT NULL, -- 'PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED'
    payment_method VARCHAR(50), -- 'CREDIT_CARD', 'DEBIT_CARD'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Endpoints REST:
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/api/payments/checkout-session` | Autenticado | Crea una sesión o intención de pago con la pasarela |
| `POST` | `/api/payments/process` | Autenticado | Procesa el cobro directo de una reserva pendiente |
| `POST` | `/api/payments/webhook` | Público (Firma Stripe) | Webhook asíncrono para eventos de la pasarela |
| `GET` | `/api/payments/:id` | Autenticado | Consulta el recibo y estado de una transacción |
| `POST` | `/api/payments/:id/refund` | Admin / Interno | Ejecuta un reembolso total o parcial |

---

### 8. Microservicio de Notificaciones (Notifications Service)

- **Directorio:** `services/notification-service/`
- **Puerto:** `3008` (REST / Swagger UI / Health)
- **Modo:** Worker / Consumidor Asíncrono de RabbitMQ (Stateless).
- **Tecnología:** Node.js / NestJS, Nodemailer (Mailtrap/SendGrid), PDFKit, QRCode generator.
- **Estado:** ✅ `[IMPLEMENTADO]`

#### Responsabilidades:
1. Consumir eventos del broker de mensajería sin impactar los tiempos de respuesta del checkout (`user.registered`, `booking.confirmed`, `payment.failed`, `booking.checkin.reminder`, `payment.refunded`).
2. Generar el **Voucher de Confirmación en PDF** con diseño elegante, datos de la reserva y código QR para lectura en recepción.
3. Enviar correos electrónicos transaccionales:
   - Correo de bienvenida tras registro.
   - Confirmación de reserva con voucher PDF adjunto.
   - Notificación de pago fallido y recordatorio de expiración de reserva.
   - Recordatorio de check-in 24 horas antes de la llegada.
   - Comprobante de reembolso en caso de cancelación.

---

### 9. Microservicio de Reseñas y Calificaciones (Reviews Service - Complementario)

- **Directorio:** `services/reviews-service/`
- **Puerto:** `3007`
- **Tecnología:** NestJS, Mongoose.
- **Base de Datos:** MongoDB (`hotel_reviews_db`).
- **Propósito:** Permite a huéspedes calificar su estancia (1 a 5 estrellas) con comentarios y fotos tras haber completado su reserva (`COMPLETED`). Almacena documentos NoSQL flexibles y calcula el puntaje promedio del hotel.

---

### 10. Microservicio de Analítica y Reportes (Analytics Service - Complementario)

- **Directorio:** `services/analytics-service/`
- **Puerto:** `3008`
- **Tecnología:** NestJS, TimescaleDB o PostgreSQL Read-Replica.
- **Propósito:** Dashboard gerencial que computa KPIs hoteleros estándar:
  - **ADR (Average Daily Rate):** Tarifa media diaria de habitaciones vendidas.
  - **RevPAR (Revenue Per Available Room):** Ingreso por habitación disponible.
  - Tasa de ocupación mensual y porcentaje de cancelaciones.

---

## 🔄 Flujos de Negocio y Patrón Saga

### Flujo de Reserva Exitoso (Happy Path)

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as 💻 Huésped
    participant Gate as 🚪 API Gateway
    participant Avail as 📅 Availability MS
    participant Book as 📝 Bookings MS (Saga)
    participant Pay as 💳 Payments MS
    participant Broker as 📨 RabbitMQ
    participant Notif as 🔔 Notifications MS

    Cliente->>Gate: 1. POST /api/availability/search (Hotel, Fechas)
    Gate->>Avail: Consultar disponibilidad
    Avail-->>Cliente: Habitaciones disponibles con cotizaciones

    Cliente->>Gate: 2. POST /api/bookings (Crear reserva con habitación seleccionada)
    Gate->>Book: Iniciar Saga de Reserva
    Book->>Avail: Solicitar bloqueo temporal (Soft Hold de 10 min en Redis)
    Avail-->>Book: Habitación bloqueada con éxito
    Book-->>Cliente: Reserva creada en estado 'PENDING_PAYMENT' + bookingId

    Cliente->>Gate: 3. POST /api/payments/process (bookingId, tarjeta/token)
    Gate->>Pay: Procesar transacción de pago
    Pay->>Pay: Ejecutar cobro contra pasarela (Stripe Sandbox)
    Pay->>Broker: Publicar evento 'PaymentSucceeded' (bookingId, paymentId)
    Pay-->>Cliente: Pago aprobado satisfactoriamente

    par Orquestación Asíncrona vía RabbitMQ
        Broker->>Book: Consumir 'PaymentSucceeded' -> Actualizar a 'CONFIRMED'
        Broker->>Avail: Consumir 'PaymentSucceeded' -> Grabar reserva definitiva en inventario
        Broker->>Notif: Consumir 'PaymentSucceeded' -> Generar Voucher PDF (QR) y enviar correo
    end
```

### Flujo Compensatorio por Pago Fallido o Expiración

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as 💻 Huésped
    participant Gate as 🚪 API Gateway
    participant Book as 📝 Bookings MS
    participant Pay as 💳 Payments MS
    participant Broker as 📨 RabbitMQ
    participant Avail as 📅 Availability MS
    participant Notif as 🔔 Notifications MS

    Cliente->>Gate: POST /api/payments/process (Tarjeta declinada o fondos insuficientes)
    Gate->>Pay: Intentar cobro
    Pay->>Pay: Fallo en pasarela de pagos
    Pay->>Broker: Publicar evento 'PaymentFailed' (bookingId, motivo)
    Pay-->>Cliente: Error 402: Pago declinado

    par Transacciones de Compensación (Rollback)
        Broker->>Book: Consumir 'PaymentFailed' -> Actualizar estado a 'CANCELLED'
        Broker->>Avail: Consumir 'PaymentFailed' -> Liberar candado/bloqueo temporal en Redis
        Broker->>Notif: Consumir 'PaymentFailed' -> Enviar correo informativo con link de reintento
    end
```

---

## 🛡 Estrategia Técnica Anti-Overbooking

El desafío más crítico en un sistema de reservas es garantizar que **dos personas no puedan reservar la misma habitación en fechas solapadas simultáneamente**.

La arquitectura implementa una estrategia en **3 niveles de defensa**:

### Nivel 1: Bloqueo Distribuido Atómico con Redis (Redlock)
Cuando el usuario presiona "Reservar":
1. Se adquiere un candado en Redis:
   ```text
   SET lock:room:{roomId}:dates:{checkIn}_{checkOut} "user_uuid" NX PX 600000
   ```
   - `NX`: Solo se asigna si la clave no existe. Si otro usuario intenta lo mismo, recibe un error inmediato de "Habitación en proceso de reserva por otro usuario".
   - `PX 600000`: Expira en 10 minutos (600,000 ms) automáticamente si el usuario abandona la pestaña.

### Nivel 2: Consulta Dinámica de Solapamiento de Rangos
Una habitación se considera disponible si NO existe ninguna reserva confirmada o en espera cuyo rango se intercepte:
$$\text{Existe Solapamiento} \iff (\text{Nueva\_Entrada} < \text{Existente\_Salida}) \land (\text{Nueva\_Salida} > \text{Existente\_Entrada})$$

### Nivel 3: Restricción Dura en Base de Datos (PostgreSQL GiST Exclusion Constraint)
A nivel de PostgreSQL, la tabla de reservas cuenta con un índice de exclusión usando la extensión `btree_gist`:
```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE room_reservations
ADD CONSTRAINT no_overlapping_room_bookings
EXCLUDE USING gist (
    room_id WITH =,
    daterange(check_in_date, check_out_date, '[)') WITH &&
)
WHERE (status IN ('CONFIRMED', 'PENDING_PAYMENT'));
```
> **Garantía matemática:** Incluso si dos hilos intentaran insertar una reserva simultánea eludiendo la capa de aplicación, el motor de base de datos PostgreSQL abortará la segunda transacción con error de violación de restricción (`exclusion constraint violation`).

---

## 📁 Estructura del Proyecto (Monorepo)

```plaintext
hotel-reservation-system/
├── .env                              # Variables de entorno globales del proyecto
├── .env.example                      # Plantilla de variables de entorno
├── docker-compose.yml                # Orquestación multicontenedor local
├── README.md                         # Documento de arquitectura y microservicios
├── .github/
│   └── workflows/
│       └── api-gateway-ci.yml        # Pipeline de Integración Continua (CI/CD)
├── gateway/                          # [IMPLEMENTADO] API Gateway NestJS
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── config/                   # Configuración de URLs de microservicios
│       ├── health/                   # Endpoint de salud /health
│       ├── proxy/                    # Middleware de proxy inverso dinámico
│       └── common/                   # Filtros, loggers, decoradores de roles
├── frontend/                         # [IMPLEMENTADO] Aplicación Web SPA
│   ├── Dockerfile
│   ├── nginx.conf                    # Servidor web Nginx de producción
│   ├── index.html                    # Dashboard interactivo con terminal de logs en vivo
│   ├── css/styles.css                # Estilos visuales con diseño moderno
│   └── js/api.js                     # Cliente HTTP conectado al API Gateway
└── services/                         # Microservicios Downstream
    ├── auth-service/                 # [IMPLEMENTADO] Microservicio de Usuarios y JWT
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/
    │       ├── auth/                 # Controladores y servicios de login/registro
    │       └── users/                # Entidad de usuario y repositorios
    ├── hotels-service/               # [IMPLEMENTADO] Catálogo de hoteles y sedes
    ├── rooms-service/                # [A DESARROLLAR] Habitaciones y tipos
    ├── availability-service/         # [A DESARROLLAR] Redis locks y motor de fechas
    ├── booking-service/              # [A DESARROLLAR] Orquestador Saga de reservas
    ├── payment-service/              # [A DESARROLLAR] Pagos y webhooks Stripe
    └── notification-service/         # [IMPLEMENTADO] Worker asíncrono RabbitMQ + PDFKit + Nodemailer
```

---

## 🔌 Matriz de Puertos y Variables de Entorno

| Servicio / Contenedor | Puerto Host | Puerto Contenedor | Base de Datos / Recurso | Variable de URL en Gateway |
|---|---|---|---|---|
| **API Gateway** | `3000` | `3000` | N/A | `http://localhost:3000` |
| **Frontend Web** | `80`, `5173` | `80` | Nginx Static | `http://localhost` |
| **Auth Service** | `3001` | `3001` | PostgreSQL (`5432`) | `AUTH_SERVICE_URL` |
| **Hotels Service** | `3002` | `3002` | PostgreSQL (`5433`) | `HOTELS_SERVICE_URL` |
| **Notification Service** | `3008` | `3008` | Worker AMQP + PDF + SMTP | `NOTIFICATIONS_SERVICE_URL` |
| **Rooms Service** | `3003` | `3003` | PostgreSQL (`5434`) | `ROOMS_SERVICE_URL` |
| **Availability Service** | `3004` | `3004` | PostgreSQL + Redis (`6379`)| `AVAILABILITY_SERVICE_URL` |
| **Bookings Service** | `3005` | `3005` | PostgreSQL (`5436`) | `BOOKINGS_SERVICE_URL` |
| **Payments Service** | `3006` | `3006` | PostgreSQL (`5437`) | `PAYMENTS_SERVICE_URL` |
| **RabbitMQ UI** | `15672` | `15672` | Panel de Control AMQP | `amqp://guest:guest@rabbitmq:5672` |

---

## 🚀 Guía de Ejecución y Puesta en Marcha

### Prerrequisitos
- [Docker Desktop](https://www.docker.com/) instalado y corriendo en Windows/Linux/Mac.
- [Node.js](https://nodejs.org/) v20+ (opcional para desarrollo local sin Docker).

### 1. Clonar y Configurar Entorno
```bash
# Copiar variables de entorno
cp .env.example .env
```

### 2. Levantar la Infraestructura con Docker Compose
```bash
# Construir y levantar servicios en segundo plano
docker compose up -d --build
```

### 3. Verificar Servicios Activos
```bash
docker compose ps
```
Deberás ver los contenedores en estado `healthy` / `running`:
- `hotel_auth_db`
- `hotel_auth_service`
- `hotel_hotels_db`
- `hotel_hotels_service`
- `hotel_rabbitmq`
- `hotel_notification_service`
- `hotel_api_gateway`
- `hotel_frontend`

### 4. Accesos Web
- **Frontend SPA:** [http://localhost](http://localhost) o [http://localhost:5173](http://localhost:5173)
- **API Gateway Health Check:** [http://localhost:3000/health](http://localhost:3000/health)
- **Endpoints de Autenticación:** [http://localhost:3000/api/auth/profile](http://localhost:3000/api/auth/profile)
- **Endpoints de Catálogo de Hoteles:** [http://localhost:3000/api/hotels](http://localhost:3000/api/hotels)
- **Microservicio de Notificaciones & Swagger:** [http://localhost:3008/api/docs](http://localhost:3008/api/docs)
- **Panel RabbitMQ Management:** [http://localhost:15672](http://localhost:15672) (Usuario: `guest` / `guest`)

---

## 📈 Roadmap y Orden Recomendado de Implementación

1. ✅ **Capa Perimetral e Identidad (Completado):**
   - API Gateway con enrutamiento inverso y validación JWT.
   - Microservicio de Usuarios y Autenticación con PostgreSQL y hashing BCrypt.
   - Frontend interactivo con consola de depuración y registro/login.
2. ✅ **Catálogo Central de Hoteles (Completado):**
   - Microservicio `hotels-service` con TypeORM, PostgreSQL y RBAC para administradores hoteleros.
   - Integración visual en el Frontend y filtros dinámicos.
3. ✅ **Notificaciones y Vouchers PDF (Completado):**
   - Microservicio `notification-service` worker asíncrono consumidor de RabbitMQ.
   - Generación de Vouchers oficiales de confirmación en PDF con código QR dinámico (PDFKit + QRCode).
   - Motor transaccional de correos con Nodemailer y 5 plantillas responsive para eventos de ciclo de vida hotelero.
4. 🔄 **Habitaciones y Tipos:**
   - Crear `rooms-service` (inventario de tipos de habitaciones, amenidades y fotos).
5. 🔄 **Motor de Disponibilidad y Bloqueos:**
   - Implementar `availability-service` con Redis para el candado temporal (*hold* de 10 min) y filtros por fecha.
6. 🔄 **Reservas y Transacciones (Saga Pattern):**
   - Implementar `booking-service` con estados transaccionales.
   - Implementar `payment-service` simulando checkout con Stripe.
   - Publicación de eventos hacia RabbitMQ para consumo por `notification-service`.
