#!/bin/sh
set -e

export NODE_ENV=${NODE_ENV:-production}
export DB_SSL=${DB_SSL:-true}
export AUTH_SERVICE_URL=http://127.0.0.1:3001
export HOTELS_SERVICE_URL=http://127.0.0.1:3002
export ROOMS_SERVICE_URL=http://127.0.0.1:3003
export AVAILABILITY_SERVICE_URL=http://127.0.0.1:3004
export BOOKINGS_SERVICE_URL=http://127.0.0.1:3005
export BOOKING_SERVICE_URL=http://127.0.0.1:3005
export PAYMENTS_SERVICE_URL=http://127.0.0.1:3006
export NOTIFICATION_SERVICE_URL=http://127.0.0.1:3008
export NOTIFICATIONS_SERVICE_URL=http://127.0.0.1:3008

# Defaults seguros para correo y administrador (pueden sobrescribirse con Secrets)
export ADMIN_SEED_EMAIL=${ADMIN_SEED_EMAIL:-mauromedina2508@gmail.com}
export SMTP_SERVICE=${SMTP_SERVICE:-gmail}
export SMTP_HOST=${SMTP_HOST:-smtp.gmail.com}
export SMTP_PORT=${SMTP_PORT:-465}
export SMTP_SECURE=${SMTP_SECURE:-true}
export SMTP_USER=${SMTP_USER:-mauromedina2508@gmail.com}
export SMTP_FROM=${SMTP_FROM:-"Travel & Resorts <mauromedina2508@gmail.com>"}

# Si no se configuró un REDIS_URL externo (Upstash), iniciar Redis embebido local
if [ -z "${REDIS_URL}" ]; then
  echo "🔴 Iniciando Redis embebido local en 127.0.0.1:6379..."
  redis-server --daemonize yes --dir /tmp --port 6379 --bind 127.0.0.1 --save "" --appendonly no
  export REDIS_HOST=127.0.0.1
  export REDIS_PORT=6379
fi

echo "🚀 Iniciando los 8 servicios NestJS en modo Cloud All-in-One..."

PORT=3001 node /app/services/auth-service/dist/main.js &
PORT=3002 node /app/services/hotels-service/dist/main.js &
PORT=3003 node /app/services/rooms-service/dist/main.js &
PORT=3004 node /app/services/availability-service/dist/main.js &
PORT=3005 node /app/services/booking-service/dist/main.js &
PORT=3006 node /app/services/payment-service/dist/main.js &
PORT=3008 node /app/services/notification-service/dist/main.js &
PORT=3000 node /app/gateway/dist/main.js &

WEB_PORT=${PORT:-7860}

# Configuración Nginx 100% compatible con contenedores sin privilegios root (Hugging Face UID 1000)
mkdir -p /tmp/nginx/body /tmp/nginx/proxy /tmp/nginx/fastcgi /tmp/nginx/uwsgi /tmp/nginx/scgi

cat <<EOF > /tmp/nginx.conf
worker_processes auto;
pid /tmp/nginx.pid;
error_log /dev/stderr warn;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    access_log /dev/stdout;
    sendfile on;
    keepalive_timeout 65;

    client_body_temp_path /tmp/nginx/body;
    proxy_temp_path /tmp/nginx/proxy;
    fastcgi_temp_path /tmp/nginx/fastcgi;
    uwsgi_temp_path /tmp/nginx/uwsgi;
    scgi_temp_path /tmp/nginx/scgi;

    server {
        listen ${WEB_PORT};
        server_name _;

        root /app/frontend;
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
}
EOF

echo "🌐 Nginx escuchando en puerto ${WEB_PORT} -> API Gateway (127.0.0.1:3000)"
exec nginx -c /tmp/nginx.conf -g "daemon off;"
