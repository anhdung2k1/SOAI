from fastapi import HTTPException, Query
from fastapi import APIRouter

router = APIRouter()
from services.knowledge_base_service import KnowledgeBaseService
from models.response_models import QueryRequest, AddDocumentRequest
from config.constants import DEFAULT_COLLECTION_NAME


@router.post("/documents/add/", status_code=201)
async def add_document(
    request: AddDocumentRequest,
):
    result = KnowledgeBaseService.add(
        texts=request.texts,
        collection_name=request.collection_name,
        embedding_model=request.embedding_model,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Can't add document.")

    return {"message": "Document added successfully"}


@router.post("/documents/search/")
async def search_knowledge_base(request: QueryRequest):
    """Searches for the most relevant knowledge based on user input."""
    return {
        "results": KnowledgeBaseService.search(
            query=request.query,
            collection_name=request.collection_name,
            embedding_model=request.embedding_model,
        )
    }


@router.get("/documents")
async def list_documents(
    offset: int = Query(0, alias="page_offset"),
    limit: int = Query(100, alias="page_size"),
    collection_name: str = DEFAULT_COLLECTION_NAME,
):
    return KnowledgeBaseService.retrieve(collection_name)
