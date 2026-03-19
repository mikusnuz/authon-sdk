FROM python:3.12-slim
WORKDIR /app
COPY python/ /authon-sdk/
COPY examples/python-django/ .
RUN pip install --no-cache-dir /authon-sdk/ && pip install --no-cache-dir -r requirements.txt
RUN python manage.py collectstatic --noinput 2>/dev/null || true
EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "project.wsgi:application"]
