FROM node:20-alpine AS sdk-build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile --ignore-scripts || pnpm install --no-frozen-lockfile
RUN pnpm --filter '@authon/js' --filter '@authon/shared' build

FROM golang:1.22-alpine AS build
WORKDIR /workspace
COPY go/ ./go/
COPY examples/go/ ./examples/go/
WORKDIR /workspace/examples/go
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o server .

FROM alpine:3.20
WORKDIR /app
COPY --from=build /workspace/examples/go/server ./server
COPY --from=build /workspace/examples/go/templates ./templates
COPY --from=sdk-build /app/packages/js/dist/index.js ./static/authon.js
EXPOSE 3000
CMD ["./server"]
