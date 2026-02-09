from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID
from enum import Enum


# =========================
# ENUMS
# =========================
class TicketStatus(str, Enum):
    pending = "pending"
    processed = "processed"
    resolved = "resolved"
    error = "error"


class TicketCategory(str, Enum):
    billing = "billing"
    technical = "technical"
    feature = "feature"


class TicketUrgency(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


# =========================
# REQUEST SCHEMAS
# =========================
class TicketCreate(BaseModel):
    email: EmailStr
    message: str = Field(..., min_length=3)


class TicketUpdateDraft(BaseModel):
    ai_draft: str = Field(
        ...,
        min_length=3,
        description="Edited AI draft reply by human agent"
    )


# =========================
# RESPONSE SCHEMAS
# =========================
class TicketResponse(BaseModel):
    id: UUID
    status: TicketStatus


class TicketListItem(BaseModel):
    id: UUID
    email: EmailStr
    category: Optional[TicketCategory]
    urgency: Optional[TicketUrgency]
    status: TicketStatus

    model_config = {
        "from_attributes": True
    }


class TicketDetailResponse(BaseModel):
    id: UUID
    email: EmailStr
    message: str
    category: Optional[TicketCategory]
    urgency: Optional[TicketUrgency]
    sentiment_score: Optional[int]
    ai_draft: Optional[str]
    status: TicketStatus

    model_config = {
        "from_attributes": True
    }


# =========================
# AI INTERNAL SCHEMA
# =========================
class AITriageResult(BaseModel):
    category: str
    sentiment_score: int = Field(..., ge=1, le=10)
    urgency: str
    draft_reply: str
