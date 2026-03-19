FROM node:20-alpine AS build
WORKDIR /app
COPY examples/portal/ .
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
