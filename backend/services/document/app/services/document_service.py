import shutil
from fastapi import APIRouter, File, UploadFile, BackgroundTasks
from config.constants import *
from services.process_file_service import ProcessFileService


class DocumentService:
    @staticmethod
    def upload_file(file: UploadFile, background_tasks: BackgroundTasks):
        """Upload the file to the server."""
        file_extension = file.filename.split(".")[-1].lower()
        if file_extension not in SUPPORT_FILE_EXTENSIONS:
            return False, f"Don't support {file_extension}"
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)

        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run processing in the background
        background_tasks.add_task(
            ProcessFileService.process_file, file_path, file_extension
        )
        return True, f"File {file.filename} is uploaded successfully"
