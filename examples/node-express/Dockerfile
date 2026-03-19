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
COPY examples/node-express/package.json ./examples/node-express/package.json
COPY examples/node-express/tsconfig.json ./examples/node-express/tsconfig.json
COPY examples/node-express/src/ ./examples/node-express/src/
WORKDIR /app/examples/node-express
RUN npm install --install-links
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/examples/node-express/dist ./dist
COPY --from=build /app/examples/node-express/src/views ./src/views
COPY --from=build /app/examples/node-express/node_modules ./node_modules
COPY --from=build /app/examples/node-express/package.json ./package.json
EXPOSE 3000
CMD ["node", "dist/server.js"]
