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
COPY examples/nextjs/ ./examples/nextjs/
WORKDIR /app/examples/nextjs
RUN npm install
ARG NEXT_PUBLIC_AUTHON_PROJECT_ID
ARG NEXT_PUBLIC_AUTHON_API_URL
ENV NEXT_PUBLIC_AUTHON_PROJECT_ID=${NEXT_PUBLIC_AUTHON_PROJECT_ID}
ENV NEXT_PUBLIC_AUTHON_API_URL=${NEXT_PUBLIC_AUTHON_API_URL}
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/examples/nextjs/.next ./.next
COPY --from=build /app/examples/nextjs/node_modules ./node_modules
COPY --from=build /app/examples/nextjs/package.json ./
EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]
