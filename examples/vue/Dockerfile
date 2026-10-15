FROM node:20-alpine AS sdk-build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile --ignore-scripts || pnpm install --no-frozen-lockfile
RUN pnpm --filter '@authon/*' --filter '!@authon/react-native' build

FROM sdk-build AS build
# Build inside the pnpm workspace so workspace:* resolves to the SDK packages built above.
COPY examples/vue/ ./examples/vue/
RUN pnpm install --frozen-lockfile --ignore-scripts --filter authon-vue-example... || pnpm install --no-frozen-lockfile --filter authon-vue-example...
WORKDIR /app/examples/vue
ARG VITE_AUTHON_PUBLISHABLE_KEY
ARG VITE_AUTHON_API_URL
RUN pnpm run build

FROM nginx:alpine
COPY --from=build /app/examples/vue/dist /usr/share/nginx/html
RUN echo 'server { listen 80; root /usr/share/nginx/html; location / { try_files $uri /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
