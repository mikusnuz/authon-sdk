FROM node:20-alpine AS sdk-build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile --ignore-scripts || pnpm install --no-frozen-lockfile
RUN pnpm -r build --filter '!@authon/react-native'

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=sdk-build /app/packages/ ./packages/
COPY examples/vanilla-js/ ./examples/vanilla-js/
WORKDIR /app/examples/vanilla-js
RUN npm install
ARG VITE_AUTHON_PROJECT_ID
ARG VITE_AUTHON_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/examples/vanilla-js/dist /usr/share/nginx/html
RUN echo 'server { listen 80; root /usr/share/nginx/html; location / { try_files $uri /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
