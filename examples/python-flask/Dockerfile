FROM python:3.12-slim
WORKDIR /app
COPY python/ /authon-sdk/
COPY examples/python-flask/ .
RUN pip install --no-cache-dir /authon-sdk/ && pip install --no-cache-dir -r requirements.txt
EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
