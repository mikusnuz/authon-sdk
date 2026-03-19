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
COPY examples/nuxt/ ./examples/nuxt/
WORKDIR /app/examples/nuxt
RUN npm install
ARG NUXT_PUBLIC_AUTHON_PROJECT_ID
ARG NUXT_PUBLIC_AUTHON_API_URL
ENV NUXT_PUBLIC_AUTHON_PROJECT_ID=$NUXT_PUBLIC_AUTHON_PROJECT_ID
ENV NUXT_PUBLIC_AUTHON_API_URL=$NUXT_PUBLIC_AUTHON_API_URL
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/examples/nuxt/.output/ ./.output/
ENV PORT=3000
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
