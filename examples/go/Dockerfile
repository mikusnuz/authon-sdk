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
EXPOSE 3000
CMD ["./server"]
