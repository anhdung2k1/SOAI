import os

CONSUL_HOST = os.getenv("CONSUL_HOST", "localhost")
SERVICE_NAME = os.getenv("SERVICE_NAME", "chatbot-service")
SERVICE_PORT = int(os.getenv("SERVICE_PORT", 8000))

DEFAULT_COLLECTION_NAME = "knowledge_base"
DEFAULT_EMBEDDING_MODEL = "hkunlp/instructor-large"

MESSAGE_ADD_DOCUMENT_SUCCESS = "Document added successfully"
MESSAGE_ADD_DOCUMENT_FAILED = "Failed to add document"