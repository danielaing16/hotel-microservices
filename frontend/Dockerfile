FROM nginx:alpine

ENV PORT=80
ENV API_GATEWAY_URL=http://api-gateway:3000
ENV NGINX_ENVSUBST_FILTER="^(PORT|API_GATEWAY_URL)$"

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
