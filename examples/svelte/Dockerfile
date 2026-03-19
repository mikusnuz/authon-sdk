FROM node:20-alpine AS sdk-build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile --ignore-scripts || pnpm install --no-frozen-lockfile
RUN pnpm --filter '@authon/*' --filter '!@authon/react-native' build

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=sdk-build /app/packages/ ./packages/
COPY examples/svelte/ ./examples/svelte/
WORKDIR /app/examples/svelte
RUN npm install
ARG PUBLIC_AUTHON_PROJECT_ID
ARG PUBLIC_AUTHON_API_URL
ENV PUBLIC_AUTHON_PROJECT_ID=$PUBLIC_AUTHON_PROJECT_ID
ENV PUBLIC_AUTHON_API_URL=$PUBLIC_AUTHON_API_URL
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/examples/svelte/build/ ./build/
ENV PORT=3000
ENV ORIGIN=${ORIGIN:-http://localhost:3000}
ENV PROTOCOL_HEADER=x-forwarded-proto
ENV HOST_HEADER=x-forwarded-host
EXPOSE 3000
CMD ["node", "build/index.js"]
