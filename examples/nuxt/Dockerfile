FROM node:20-alpine AS build
WORKDIR /app

COPY packages/ ./packages/
COPY examples/nuxt/ ./examples/nuxt/

WORKDIR /app/examples/nuxt
RUN npm install
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/examples/nuxt/.output ./
EXPOSE 3000
CMD ["node", "server/index.mjs"]
