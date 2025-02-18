import logging
from services.ollama_service import OllamaService

logger = logging.getLogger(__file__)


class ChatBotService:
    @staticmethod
    def list_models():
        ollama_service = OllamaService()
        return ollama_service.list_models()

    @staticmethod
    async def query(messages, model, temperature):
        ollama_service = OllamaService()
        async for chunk in ollama_service.query(messages, model, temperature):
            yield chunk
