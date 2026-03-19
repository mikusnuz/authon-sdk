FROM node:20-alpine AS sdk-build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile --ignore-scripts || pnpm install --no-frozen-lockfile
RUN pnpm --filter '@authon/node' --filter '@authon/shared' build

FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=sdk-build /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=sdk-build /app/packages/ ./packages/
COPY examples/node-express/ ./examples/node-express/
RUN pnpm install --no-frozen-lockfile
WORKDIR /app/examples/node-express
RUN pnpm run build

FROM build
WORKDIR /app/examples/node-express
EXPOSE 3000
CMD ["node", "dist/server.js"]
