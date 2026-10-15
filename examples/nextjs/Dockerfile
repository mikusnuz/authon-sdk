FROM node:20-alpine AS sdk-build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile --ignore-scripts || pnpm install --no-frozen-lockfile
RUN pnpm --filter '@authon/*' --filter '!@authon/react-native' build

FROM sdk-build AS build
# Build inside the pnpm workspace so workspace:* resolves to the SDK packages built above.
COPY examples/nextjs/ ./examples/nextjs/
RUN pnpm install --frozen-lockfile --ignore-scripts --filter authon-nextjs-example... || pnpm install --no-frozen-lockfile --filter authon-nextjs-example...
WORKDIR /app/examples/nextjs
ARG NEXT_PUBLIC_AUTHON_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_AUTHON_API_URL
ENV NEXT_PUBLIC_AUTHON_PUBLISHABLE_KEY=$NEXT_PUBLIC_AUTHON_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_AUTHON_API_URL=$NEXT_PUBLIC_AUTHON_API_URL
RUN pnpm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app/examples/nextjs/.next/standalone ./
COPY --from=build /app/examples/nextjs/.next/static ./examples/nextjs/.next/static
WORKDIR /app/examples/nextjs
EXPOSE 3000
CMD ["node", "server.js"]
