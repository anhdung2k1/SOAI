from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class CVUploadResponseSchema(BaseModel):
    message: str

class CVBasicSchema(BaseModel):
    id: int
    candidate_name: str
    username: str
    email: str
    matched_position: Optional[str]
    matched_score: Optional[float]
    status: str
    datetime: Optional[datetime]