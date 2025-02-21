import logging
from fastapi import APIRouter, File, UploadFile, BackgroundTasks
from fastapi.responses import JSONResponse
from config.constants import *
from services.document_service import DocumentService
from models.response_models import StandardResponse

router = APIRouter()

logger = logging.getLogger(__file__)


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...), background_tasks: BackgroundTasks = BackgroundTasks()
):
    try:
        """Upload the file to the server."""
        result, message = DocumentService.upload_file(file, background_tasks)
        if not result:
            return JSONResponse(
                content=StandardResponse(status="error", message=message).dict(),
                status_code=400,
            )
        return JSONResponse(
            content=StandardResponse(status="success", message=message).dict(),
            status_code=200,
        )

    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        return JSONResponse(
            content=StandardResponse(
                status="error", message="Failed to upload", data={str(e)}
            ).dict(),
            status_code=500,
        )
