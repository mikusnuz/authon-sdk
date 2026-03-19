FROM node:20-alpine AS sdk-build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile --ignore-scripts || pnpm install --no-frozen-lockfile
RUN pnpm --filter '@authon/js' --filter '@authon/shared' build

FROM python:3.12-slim AS build
WORKDIR /app

COPY python/ ./python/
RUN pip install --no-cache-dir ./python/

COPY examples/python-fastapi/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY examples/python-fastapi/app/ ./app/
COPY --from=sdk-build /app/packages/js/dist/index.js ./app/static/authon.js

EXPOSE 3000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000"]
