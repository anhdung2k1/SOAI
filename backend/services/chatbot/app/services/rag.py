import os
import uuid
from typing import List
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.llms import Ollama
from langchain_community.vectorstores import Qdrant
from langchain.prompts import PromptTemplate
from langchain.chains.question_answering import load_qa_chain

# Constants
COLLECTION_NAME = "rag_collection"
VECTOR_DIM = 384  # Ensure this matches the embedding model output size

class QdrantDB:
    """Handles Qdrant vector database operations."""

    def __init__(self, collection_name: str = COLLECTION_NAME):
        self.collection_name = collection_name
        self.client = QdrantClient("qdrant", port=6333)
        self._initialize_collection()

    def _initialize_collection(self):
        """Ensures the collection exists, or creates it if needed."""
        if not self.client.collection_exists(self.collection_name):
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(size=VECTOR_DIM, distance=Distance.COSINE),
            )

    def insert_documents(self, texts: List[str], embeddings: List[List[float]]):
        """Inserts multiple documents into Qdrant."""
        points = [
            PointStruct(
                id=str(uuid.uuid4()),
                vector=embedding,
                payload={"text": text},
            )
            for text, embedding in zip(texts, embeddings)
        ]
        self.client.upsert(collection_name=self.collection_name, points=points)

    def retrieve_documents(self, query: str, retriever):
        """Retrieves relevant documents for a query."""
        return retriever.get_relevant_documents(query)


class EmbeddingModel:
    """Handles text embedding generation using Hugging Face models."""

    def __init__(self):
        self.model = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generates embeddings for multiple texts."""
        return self.model.embed_documents(texts)


class RAGPipeline:
    """Implements a RAG (Retrieval-Augmented Generation) pipeline using Ollama."""

    def __init__(
        self,
        vector_db: QdrantDB,
        embedding_model: EmbeddingModel,
        model: str = "deepseek-r1:1.5b",
    ):
        self.vector_db = vector_db
        self.embedding_model = embedding_model
        self.llm = Ollama(model=model)  # Change model if needed
        self.vector_store = Qdrant(
            client=self.vector_db.client,
            collection_name=COLLECTION_NAME,
            embeddings=self.embedding_model.model,
        )
        self.retriever = self.vector_store.as_retriever()
        self.qa_chain = self._initialize_qa_chain()

    def _initialize_qa_chain(self):
        """Creates a custom prompt and initializes the QA retrieval chain."""
        prompt_template = PromptTemplate(
            input_variables=["context", "question"],
            template="Context: {context}\n\nQuestion: {question}\n\nAnswer:",
        )
        return load_qa_chain(self.llm, chain_type="stuff", prompt=prompt_template)

    def add_documents(self, texts: List[str]):
        """Embeds and stores documents in Qdrant."""
        embeddings = self.embedding_model.generate_embeddings(texts)
        self.vector_db.insert_documents(texts, embeddings)

    def ask_question(self, query: str):
        """Retrieves relevant documents and generates an answer using the LLM."""
        retrieved_docs = self.vector_db.retrieve_documents(query, self.retriever)
        return self.qa_chain.run(input_documents=retrieved_docs, question=query)


# # ✅ Step 1: Initialize Components
# vector_db = QdrantDB()
# embedding_model = EmbeddingModel()
# rag_pipeline = RAGPipeline(vector_db, embedding_model)

# # ✅ Step 2: Add Documents to Qdrant
# documents = [
#     "LangChain simplifies AI application development.",
#     "Qdrant is a powerful vector database for semantic search.",
#     "Ollama is an offline LLM framework for running models locally."
# ]
# rag_pipeline.add_documents(documents)
# print("✅ Documents added successfully!")

# # ✅ Step 3: Ask a Question (RAG in Action)
# question = "What is LangChain?"
# response = rag_pipeline.ask_question(question)

# print("\n🧠 RAG Response:")
# print(response)
