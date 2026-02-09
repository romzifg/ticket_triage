from pydantic import BaseModel, EmailStr
from typing import Optional

from uuid import UUID  

class TicketCreate(BaseModel):
    email: EmailStr
    message: str

class TicketResponse(BaseModel):
    id: str
    status: str

class AITriageResult(BaseModel):
    category: str
    sentiment_score: int
    urgency: str
    draft_reply: str

class TicketListItem(BaseModel):
    id: UUID
    email: EmailStr
    category: Optional[str]
    urgency: Optional[str]
    status: str

    class Config:
        from_attributes = True

class TicketDetailResponse(BaseModel):
    id: UUID
    email: EmailStr
    message: str
    category: Optional[str]
    urgency: Optional[str]
    sentiment_score: Optional[int]
    ai_draft: Optional[str]
    status: str

    class Config:
        from_attributes = True
