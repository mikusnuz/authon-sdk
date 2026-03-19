FROM golang:1.22-alpine AS build
WORKDIR /app
COPY go/ ./go/
COPY examples/go/ ./examples/go/
WORKDIR /app/examples/go
RUN go mod download && CGO_ENABLED=0 GOOS=linux go build -o server .

FROM alpine:3.19
WORKDIR /app
COPY --from=build /app/examples/go/server .
COPY --from=build /app/examples/go/templates ./templates
COPY --from=build /app/examples/go/static ./static
EXPOSE 8080
CMD ["./server"]
