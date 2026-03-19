FROM python:3.12-slim
WORKDIR /app
COPY python/ /authon-sdk/
COPY examples/python-fastapi/ .
RUN pip install --no-cache-dir /authon-sdk/ && pip install --no-cache-dir -r requirements.txt
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
