import os

CONSUL_HOST = os.getenv("CONSUL_HOST", "localhost")
SERVICE_NAME = os.getenv("SERVICE_NAME", "chatbot-service")
SERVICE_PORT = int(os.getenv("SERVICE_PORT", 8000))

