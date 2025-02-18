import os
import logging
from qdrant_client import QdrantClient
from langchain_community.vectorstores import Qdrant
from langchain_huggingface import HuggingFaceEmbeddings

os.environ["HF_HOME"] = "/.cache/huggingface"

logger = logging.getLogger(__file__)


class QdrantService:
    """Handles Qdrant vector database operations."""

    def __init__(
        self,
        collection_name: str = "knowledge_base",
        embedding_model=None,  # Default: HuggingFaceEmbeddings
        host: str = "qdrant",
        port: int = 6333,
        model_name: str = "hkunlp/instructor-large",
    ):
        self.collection_name = collection_name
        self.client = QdrantClient(host=host, port=port)

        # Default to HuggingFace if no model is provided
        self.embedding_model = embedding_model or HuggingFaceEmbeddings(
            model_name=model_name
        )
        logger.debug(f"Initializing QdrantService with model: {model_name}")
        # Initialize vector store
        self.vector_store = Qdrant(
            client=self.client,
            collection_name=self.collection_name,
            embeddings=self.embedding_model,
        )
        logger.debug(f"QdrantService initialized with collection: {collection_name}")
        # Create a retriever
        self.retriever = self.vector_store.as_retriever(
            search_type="similarity", search_kwargs={"k": 5}  # Retrieve top 5 matches
        )
        logger.debug(f"QdrantService initialized with collection: {collection_name}")

    def retrieve_documents(self, query: str):
        """Retrieves relevant documents from Qdrant."""
        try:
            retrieved_docs = self.retriever.invoke(query)

            # Debug: Print retrieved documents
            logger.debug(f"Retrieved {retrieved_docs} documents.")

            # Validate documents before returning
            valid_docs = [
                doc
                for doc in retrieved_docs
                if isinstance(doc.page_content, str) and doc.page_content.strip()
            ]

            # If there are invalid documents, log a warning
            if len(valid_docs) < len(retrieved_docs):
                logger.debug(
                    f"Warning: {len(retrieved_docs) - len(valid_docs)} documents had empty content and were removed."
                )

            return valid_docs  # Only return valid documents
        except Exception as e:
            logger.debug(f"Error retrieving documents: {e}")
            return []
