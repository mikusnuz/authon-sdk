FROM node:20-alpine AS build
WORKDIR /app

COPY packages/ ./packages/
COPY examples/svelte/ ./examples/svelte/

WORKDIR /app/examples/svelte
RUN npm install
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/examples/svelte/build ./
COPY --from=build /app/examples/svelte/package*.json ./
RUN npm ci --production
EXPOSE 3000
CMD ["node", "index.js"]
