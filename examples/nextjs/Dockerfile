FROM node:20-alpine AS sdk-build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile --ignore-scripts || pnpm install --no-frozen-lockfile
RUN pnpm --filter '@authon/*' --filter '!@authon/react-native' build

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=sdk-build /app/packages/ ./packages/
COPY examples/nextjs/ ./examples/nextjs/
WORKDIR /app/examples/nextjs
RUN npm install
ARG NEXT_PUBLIC_AUTHON_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_AUTHON_API_URL
ENV NEXT_PUBLIC_AUTHON_PUBLISHABLE_KEY=$NEXT_PUBLIC_AUTHON_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_AUTHON_API_URL=$NEXT_PUBLIC_AUTHON_API_URL
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app/examples/nextjs/.next/standalone ./
COPY --from=build /app/examples/nextjs/.next/static ./examples/nextjs/.next/static
WORKDIR /app/examples/nextjs
EXPOSE 3000
CMD ["node", "server.js"]
