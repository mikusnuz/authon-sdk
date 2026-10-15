FROM node:20-alpine AS sdk-build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile --ignore-scripts || pnpm install --no-frozen-lockfile
RUN pnpm --filter '@authon/*' --filter '!@authon/react-native' build

FROM sdk-build AS build
# Build inside the pnpm workspace so workspace:* resolves to the SDK packages built above.
COPY examples/svelte/ ./examples/svelte/
RUN pnpm install --frozen-lockfile --ignore-scripts --filter authon-svelte-example... || pnpm install --no-frozen-lockfile --filter authon-svelte-example...
WORKDIR /app/examples/svelte
ARG PUBLIC_AUTHON_PUBLISHABLE_KEY
ARG PUBLIC_AUTHON_API_URL
ENV PUBLIC_AUTHON_PUBLISHABLE_KEY=$PUBLIC_AUTHON_PUBLISHABLE_KEY
ENV PUBLIC_AUTHON_API_URL=$PUBLIC_AUTHON_API_URL
RUN pnpm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/examples/svelte/build/ ./build/
ENV PORT=3000
ENV ORIGIN=${ORIGIN:-http://localhost:3000}
ENV PROTOCOL_HEADER=x-forwarded-proto
ENV HOST_HEADER=x-forwarded-host
EXPOSE 3000
CMD ["node", "build/index.js"]
