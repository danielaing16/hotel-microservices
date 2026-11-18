# Guía de Despliegue 100% Gratis: Render + Vercel

Esta guía despliega el ecosistema completo de **Travel & Resorts** en la nube sin tarjeta de crédito usando:

- **Vercel** (Frontend SPA `frontend/`)
- **Render** (API Gateway + 7 Microservicios NestJS usando `render.yaml`)
- **Neon.tech** (Base de datos PostgreSQL gratuita — 1 sola BD compartida sin colisión de tablas)
- **Upstash** (Redis gratuito con TLS para los Soft-Locks de disponibilidad)
- **CloudAMQP** (RabbitMQ gratuito plan *Little Lemur*)

---

## Paso 1 — Crear la Base de Datos PostgreSQL Gratis (Neon.tech)
1. Ingresa a [https://neon.tech](https://neon.tech) e inicia sesión con GitHub.
2. Haz clic en **Create Project** (nombre: `travel-resorts`, región: US East).
3. Copia el **Connection String** (empieza por `postgresql://...sslmode=require`).
4. Guárdalo: ese valor será tu variable `DATABASE_URL`.

> Las 6 tablas (`users`, `hotels`, `rooms`, `room_reservations`, `bookings`, `payments`) tienen nombres únicos y se crean automáticamente al iniciar los microservicios (`synchronize: true`).

---

## Paso 2 — Crear Redis Gratis (Upstash)
1. Ingresa a [https://upstash.com](https://upstash.com) e inicia sesión con GitHub.
2. En **Redis**, haz clic en **Create Database** (plan Free, región US East).
3. En la sección **Connect** → pestaña **Node (ioredis)**, copia la URL que empieza por `rediss://default:...`.
4. Guárdala: ese valor será tu variable `REDIS_URL`.

---

## Paso 3 — Crear RabbitMQ Gratis (CloudAMQP)
1. Ingresa a [https://www.cloudamqp.com](https://www.cloudamqp.com) y crea una cuenta gratuita.
2. Haz clic en **Create New Instance** → elige el plan **Little Lemur (Free)**.
3. Entra a tu instancia y copia el valor de **AMQP URL** (empieza por `amqps://...`).
4. Guárdala: ese valor será tu variable `RABBITMQ_URL`.

---

## Paso 4 — Desplegar los 8 Servicios en Render (1 solo clic con Blueprint)
1. Ingresa a [https://dashboard.render.com](https://dashboard.render.com) e inicia sesión con GitHub.
2. Haz clic en **New +** → **Blueprint**.
3. Selecciona tu repositorio `hotel-microservices` (rama `main`). Render detectará automáticamente el archivo `render.yaml`.
4. Render te pedirá llenar **una sola vez** las variables del grupo `hotel-cloud-secrets`:
   - `DATABASE_URL`: la URL de Neon.tech (Paso 1)
   - `REDIS_URL`: la URL `rediss://...` de Upstash (Paso 2)
   - `RABBITMQ_URL`: la URL `amqps://...` de CloudAMQP (Paso 3)
   - `ADMIN_SEED_PASSWORD`: la contraseña que quieras para `mauromedina2508@gmail.com`
   - `SMTP_PASS`: tu App Password de Gmail (16 caracteres)
   - `FRONTEND_URL`: por ahora pon `https://tu-proyecto.vercel.app` (en el Paso 5 la actualizas con tu URL real)
5. Haz clic en **Apply** y espera 3–5 minutos mientras Render compila y enciende los 8 servicios.
6. Abre la URL del servicio **`hotel-api-gateway`** (ej. `https://hotel-api-gateway.onrender.com/health`) y verifica que responda `"status": "ok"`.

> **Importante**: Si Render agregó un sufijo aleatorio al nombre del Gateway (por ejemplo `https://hotel-api-gateway-abc1.onrender.com`), actualiza esa URL en `frontend/vercel.json` y haz `git push`.

---

## Paso 5 — Desplegar el Frontend en Vercel
1. Ingresa a [https://vercel.com](https://vercel.com) e inicia sesión con GitHub.
2. Haz clic en **Add New...** → **Project** e importa tu repositorio `hotel-microservices`.
3. En **Root Directory**, haz clic en **Edit** y selecciona la carpeta **`frontend`**.
4. En **Framework Preset**, deja **Other**.
5. Haz clic en **Deploy** (tarda ~15 segundos).
6. Vercel te entregará tu URL pública (ej. `https://hotel-microservices.vercel.app`).
7. Vuelve a Render → **Environment Groups** → `hotel-cloud-secrets` → actualiza `FRONTEND_URL` con tu URL real de Vercel para que los botones dentro de los correos apunten a tu sitio en producción.

---

## Notas sobre el Plan Gratuito de Render
- Los servicios gratuitos de Render se suspenden tras **15 minutos sin tráfico**.
- Al entrar después de un tiempo inactivo, la **primera petición** puede tardar **30–50 segundos** mientras despiertan los microservicios; después de eso responde con normalidad.
- Antes de una exposición o demo, abre `https://TU-PROYECTO.vercel.app` (o `https://TU-GATEWAY.onrender.com/health/services`) 1 minuto antes para dejar todos los servicios despiertos.
