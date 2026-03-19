FROM golang:1.22-alpine AS build
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server .

FROM alpine:3.19
WORKDIR /app
COPY --from=build /app/server .
COPY --from=build /app/templates ./templates
COPY --from=build /app/static ./static
EXPOSE 8080
CMD ["./server"]
