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
COPY examples/nuxt/ ./examples/nuxt/
WORKDIR /app/examples/nuxt
RUN npm install
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/examples/nuxt/.output ./
EXPOSE 3000
CMD ["node", "server/index.mjs"]
