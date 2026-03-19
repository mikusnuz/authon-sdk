FROM python:3.12-slim AS build
WORKDIR /app

COPY python/ ./python/
RUN pip install --no-cache-dir ./python/

COPY examples/python-django/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY examples/python-django/ ./

EXPOSE 3000
CMD ["gunicorn", "project.wsgi:application", "--bind", "0.0.0.0:3000", "--workers", "2"]
