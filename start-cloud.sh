#!/bin/sh
set -e

export NODE_ENV=${NODE_ENV:-production}
export AUTH_SERVICE_URL=http://127.0.0.1:3001
export HOTELS_SERVICE_URL=http://127.0.0.1:3002
export ROOMS_SERVICE_URL=http://127.0.0.1:3003
export AVAILABILITY_SERVICE_URL=http://127.0.0.1:3004
export BOOKINGS_SERVICE_URL=http://127.0.0.1:3005
export BOOKING_SERVICE_URL=http://127.0.0.1:3005
export PAYMENTS_SERVICE_URL=http://127.0.0.1:3006
export NOTIFICATION_SERVICE_URL=http://127.0.0.1:3007
export NOTIFICATIONS_SERVICE_URL=http://127.0.0.1:3007

echo "🚀 Iniciando microservicios en modo Cloud All-in-One..."

PORT=3001 node /app/services/auth-service/dist/main.js &
PORT=3002 node /app/services/hotels-service/dist/main.js &
PORT=3003 node /app/services/rooms-service/dist/main.js &
PORT=3004 node /app/services/availability-service/dist/main.js &
PORT=3005 node /app/services/booking-service/dist/main.js &
PORT=3006 node /app/services/payment-service/dist/main.js &
PORT=3007 node /app/services/notification-service/dist/main.js &
PORT=3000 node /app/gateway/dist/main.js &

WEB_PORT=${PORT:-8080}

cat <<EOF > /etc/nginx/http.d/default.conf
server {
    listen ${WEB_PORT};
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 30s;
        proxy_read_timeout 60s;
    }

    location /health {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }

    location / {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0";
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

echo "🌐 Nginx escuchando en el puerto ${WEB_PORT} -> API Gateway (127.0.0.1:3000)"
exec nginx -g "daemon off;"
