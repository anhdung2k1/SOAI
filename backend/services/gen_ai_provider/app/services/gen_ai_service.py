from services.ollama_service import OllamaService
from services.openai_service import OpenAIService
from services.gemini_service import GeminiAIService
from services.service_factory import get_ai_service
from config.log_config import AppLogger

logger = AppLogger(__name__)


class GenAIService:
    @staticmethod
    def get_available_models():
        services = [OllamaService(), OpenAIService(), GeminiAIService()]
        models = []
        for service in services:
            provider = service.__class__.__name__
            try:
                available_models = service.get_available_models()
                if available_models:
                    logger.info(f"Available models from {provider}: {available_models}")
                    models.extend(available_models)
            except Exception as e:
                logger.exception(f"Error getting models from {provider}: {e}")
        return models

    @staticmethod
    def chat(
        model: str,
        messages: list,
        temperature: float = 0.7,
    ) -> str:
        """
        Chat with the specified AI provider using user/assistant role structure.
        System instructions should be included in the first user message.
        """
        provider = "unknown"
        try:
            service = get_ai_service(model)
            provider = service.__class__.__name__
            return service.chat(messages)
        except Exception as e:
            logger.error(f"Chat error with provider {provider}: {e}")
        return "Error querying AI."
