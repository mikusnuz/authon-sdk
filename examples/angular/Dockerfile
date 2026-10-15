FROM node:20-alpine AS sdk-build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile --ignore-scripts || pnpm install --no-frozen-lockfile
RUN pnpm --filter '@authon/*' --filter '!@authon/react-native' build

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=sdk-build /app/packages/ ./packages/
COPY examples/angular/ ./examples/angular/
WORKDIR /app/examples/angular
# Example package.json files use workspace:* for local development; npm needs file: paths.
RUN node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));for(const k of ['dependencies','devDependencies'])for(const d in p[k]||{})if(String(p[k][d]).startsWith('workspace:'))p[k][d]='file:../../packages/'+d.replace('@authon/','');fs.writeFileSync('package.json',JSON.stringify(p,null,2))"
RUN npm install
ARG AUTHON_PUBLISHABLE_KEY
ARG AUTHON_API_URL
RUN sed -i "s|\${AUTHON_PUBLISHABLE_KEY}|${AUTHON_PUBLISHABLE_KEY}|g" src/environments/environment.ts && \
    sed -i "s|\${AUTHON_API_URL}|${AUTHON_API_URL:-https://api.authon.dev}|g" src/environments/environment.ts
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/examples/angular/dist/browser /usr/share/nginx/html
RUN echo 'server { listen 80; root /usr/share/nginx/html; location / { try_files $uri /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
