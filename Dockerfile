# =============================================================================
# DOCKERFILE CLOUD ALL-IN-ONE (RAILWAY / FLY.IO / KOYEB FREE TIER)
# Empaqueta Frontend + API Gateway + 7 Microservicios en 1 solo contenedor
# para no superar el límite de 3 servicios del plan gratuito de Railway.
# =============================================================================
FROM node:20-alpine AS builder
WORKDIR /app

# 1. API Gateway
COPY gateway/package*.json ./gateway/
RUN cd gateway && npm install --legacy-peer-deps
COPY gateway ./gateway
RUN cd gateway && npm run build && npm prune --production --legacy-peer-deps

# 2. Auth Service
COPY services/auth-service/package*.json ./services/auth-service/
RUN cd services/auth-service && npm install --legacy-peer-deps
COPY services/auth-service ./services/auth-service
RUN cd services/auth-service && npm run build && npm prune --production --legacy-peer-deps

# 3. Hotels Service
COPY services/hotels-service/package*.json ./services/hotels-service/
RUN cd services/hotels-service && npm install --legacy-peer-deps
COPY services/hotels-service ./services/hotels-service
RUN cd services/hotels-service && npm run build && npm prune --production --legacy-peer-deps

# 4. Rooms Service
COPY services/rooms-service/package*.json ./services/rooms-service/
RUN cd services/rooms-service && npm install --legacy-peer-deps
COPY services/rooms-service ./services/rooms-service
RUN cd services/rooms-service && npm run build && npm prune --production --legacy-peer-deps

# 5. Availability Service
COPY services/availability-service/package*.json ./services/availability-service/
RUN cd services/availability-service && npm install --legacy-peer-deps
COPY services/availability-service ./services/availability-service
RUN cd services/availability-service && npm run build && npm prune --production --legacy-peer-deps

# 6. Booking Service
COPY services/booking-service/package*.json ./services/booking-service/
RUN cd services/booking-service && npm install --legacy-peer-deps
COPY services/booking-service ./services/booking-service
RUN cd services/booking-service && npm run build && npm prune --production --legacy-peer-deps

# 7. Payment Service
COPY services/payment-service/package*.json ./services/payment-service/
RUN cd services/payment-service && npm install --legacy-peer-deps
COPY services/payment-service ./services/payment-service
RUN cd services/payment-service && npm run build && npm prune --production --legacy-peer-deps

# 8. Notification Service
COPY services/notification-service/package*.json ./services/notification-service/
RUN cd services/notification-service && npm install --legacy-peer-deps
COPY services/notification-service ./services/notification-service
RUN cd services/notification-service && npm run build && npm prune --production --legacy-peer-deps

# Etapa final ligera con Node 20 + Nginx
FROM node:20-alpine
RUN apk add --no-cache nginx && mkdir -p /run/nginx

WORKDIR /app
COPY --from=builder /app/gateway/dist ./gateway/dist
COPY --from=builder /app/gateway/node_modules ./gateway/node_modules

COPY --from=builder /app/services/auth-service/dist ./services/auth-service/dist
COPY --from=builder /app/services/auth-service/node_modules ./services/auth-service/node_modules

COPY --from=builder /app/services/hotels-service/dist ./services/hotels-service/dist
COPY --from=builder /app/services/hotels-service/node_modules ./services/hotels-service/node_modules

COPY --from=builder /app/services/rooms-service/dist ./services/rooms-service/dist
COPY --from=builder /app/services/rooms-service/node_modules ./services/rooms-service/node_modules

COPY --from=builder /app/services/availability-service/dist ./services/availability-service/dist
COPY --from=builder /app/services/availability-service/node_modules ./services/availability-service/node_modules

COPY --from=builder /app/services/booking-service/dist ./services/booking-service/dist
COPY --from=builder /app/services/booking-service/node_modules ./services/booking-service/node_modules

COPY --from=builder /app/services/payment-service/dist ./services/payment-service/dist
COPY --from=builder /app/services/payment-service/node_modules ./services/payment-service/node_modules

COPY --from=builder /app/services/notification-service/dist ./services/notification-service/dist
COPY --from=builder /app/services/notification-service/node_modules ./services/notification-service/node_modules

COPY frontend /usr/share/nginx/html
COPY start-cloud.sh /app/start-cloud.sh
RUN sed -i 's/\r$//' /app/start-cloud.sh && chmod +x /app/start-cloud.sh

EXPOSE 8080
CMD ["/bin/sh", "/app/start-cloud.sh"]
