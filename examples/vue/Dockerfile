FROM node:20-alpine AS build
WORKDIR /app

COPY packages/ ./packages/
COPY examples/vue/ ./examples/vue/

WORKDIR /app/examples/vue
RUN npm install
ARG VITE_AUTHON_PROJECT_ID
ARG VITE_AUTHON_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/examples/vue/dist /usr/share/nginx/html
RUN echo 'server { listen 80; root /usr/share/nginx/html; location / { try_files $uri /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
