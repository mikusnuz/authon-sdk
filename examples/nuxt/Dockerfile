FROM node:20-alpine AS sdk-build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile --ignore-scripts || pnpm install --no-frozen-lockfile
RUN pnpm --filter '@authon/*' --filter '!@authon/react-native' build

FROM sdk-build AS build
# Build inside the pnpm workspace so workspace:* resolves to the SDK packages built above.
COPY examples/nuxt/ ./examples/nuxt/
RUN pnpm install --frozen-lockfile --ignore-scripts --filter authon-nuxt-example... || pnpm install --no-frozen-lockfile --filter authon-nuxt-example...
WORKDIR /app/examples/nuxt
ARG NUXT_PUBLIC_AUTHON_PUBLISHABLE_KEY
ARG NUXT_PUBLIC_AUTHON_API_URL
ENV NUXT_PUBLIC_AUTHON_PUBLISHABLE_KEY=$NUXT_PUBLIC_AUTHON_PUBLISHABLE_KEY
ENV NUXT_PUBLIC_AUTHON_API_URL=$NUXT_PUBLIC_AUTHON_API_URL
RUN pnpm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/examples/nuxt/.output/ ./.output/
ENV PORT=3000
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
