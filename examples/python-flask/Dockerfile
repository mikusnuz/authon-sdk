FROM python:3.12-slim AS build
WORKDIR /app

COPY python/ ./python/
RUN pip install --no-cache-dir ./python/

COPY examples/python-flask/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY examples/python-flask/app.py ./
COPY examples/python-flask/templates/ ./templates/

EXPOSE 3000
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:3000", "--workers", "2"]
