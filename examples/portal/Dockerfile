FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate
# The portal has no SDK dependency; install it from the workspace lockfile only.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY examples/portal/ ./examples/portal/
RUN pnpm install --frozen-lockfile --ignore-scripts --filter authon-examples-portal || pnpm install --no-frozen-lockfile --filter authon-examples-portal
WORKDIR /app/examples/portal
RUN pnpm run build

FROM nginx:alpine
COPY --from=build /app/examples/portal/dist /usr/share/nginx/html
EXPOSE 80
