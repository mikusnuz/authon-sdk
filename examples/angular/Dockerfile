FROM node:20-alpine AS build
WORKDIR /app

COPY packages/ ./packages/
COPY examples/angular/ ./examples/angular/

WORKDIR /app/examples/angular
RUN npm install
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/examples/angular/dist/browser /usr/share/nginx/html
RUN echo 'server { listen 80; root /usr/share/nginx/html; location / { try_files $uri /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
