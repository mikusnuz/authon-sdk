FROM python:3.12-slim AS build
WORKDIR /app

COPY python/ ./python/
RUN pip install --no-cache-dir ./python/

COPY examples/python-fastapi/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY examples/python-fastapi/app/ ./app/

EXPOSE 3000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000"]
