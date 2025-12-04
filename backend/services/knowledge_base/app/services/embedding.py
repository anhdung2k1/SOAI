import logging
from langchain_huggingface import HuggingFaceEmbeddings

logger = logging.getLogger(__file__)
class Embedding:
    """Manages Hugging Face Embeddings with explicit get and set methods."""

    def __init__(self, model_name="hkunlp/instructor-large"):
        self._model_name = model_name  # Private variable
        self._embedding_model = None  # Lazy initialization

    def get_model_name(self):
        """Returns the current model name."""
        return self._model_name

    def set_model_name(self, new_model_name):
        """Updates the model name and resets the embedding model."""
        if not isinstance(new_model_name, str) or not new_model_name.strip():
            raise ValueError("Model name must be a non-empty string.")
        self._model_name = new_model_name
        self._embedding_model = None  # Reset model to force reload
        logger.info(f"Model name updated to: {self._model_name}")

    def get_embedding_model(self):
        """Initializes and retrieves the embedding model lazily."""
        if self._embedding_model is None:
            logger.info(f"Loading embedding model: {self._model_name}")
            self._embedding_model = HuggingFaceEmbeddings(model_name=self._model_name)
        return self._embedding_model

