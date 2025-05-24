# Use an official Python runtime as the base image
FROM python:3.12

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Set the working directory in the container
WORKDIR /app

COPY --chmod=0755 --chown=0:0 requirements.txt ./
COPY --chmod=0755 --chown=0:0 .env ./

# Install dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy application code
COPY --chmod=0755 --chown=0:0 app/ ./app/

USER 0

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003", "--reload", "--log-level", "debug"]
