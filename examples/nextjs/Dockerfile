FROM node:20-alpine AS build
WORKDIR /app

COPY packages/ ./packages/
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
COPY --from=build /app/examples/nextjs/.next/standalone ./
COPY --from=build /app/examples/nextjs/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
