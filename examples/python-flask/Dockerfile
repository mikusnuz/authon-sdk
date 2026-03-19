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

COPY examples/python-flask/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY examples/python-flask/app.py ./
COPY examples/python-flask/templates/ ./templates/
COPY --from=sdk-build /app/packages/js/dist/index.js ./static/authon.js

EXPOSE 3000
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:3000", "--workers", "2"]
