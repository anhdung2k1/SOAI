from typing import List, Optional
from pydantic import BaseModel

class CVUploadResponseSchema(BaseModel):
    message: str

class CVApplicationResponse(BaseModel):
    id: int
    candidate_name: str
    username: str
    email: str
    position: Optional[str] = None
    experience_years: Optional[int] = None
    skills: List[str] = []
    jd_skills: List[str] = []
    matched_score: Optional[float] = None
    justification: Optional[str] = None
    status: Optional[str] = None
    parsed_cv: dict = {}

    class Config:
        orm_mode = True