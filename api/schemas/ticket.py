from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
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
    general = "general"  # 👈 TAMBAHAN: untuk kategori umum


class TicketUrgency(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


# =========================
# REQUEST SCHEMAS
# =========================
class TicketCreate(BaseModel):
    email: EmailStr
    message: str = Field(
        ..., 
        min_length=10,  # 👈 UBAH: dari 3 ke 10 agar lebih meaningful
        max_length=5000,  # 👈 TAMBAHAN: batasi panjang message
        description="Support ticket message"
    )


class TicketUpdateDraft(BaseModel):
    ai_draft: str = Field(
        ...,
        min_length=10,  # 👈 UBAH: dari 3 ke 10
        max_length=10000,  # 👈 TAMBAHAN: batasi panjang draft
        description="Edited AI draft reply by human agent"
    )


# =========================
# RESPONSE SCHEMAS
# =========================
class TicketResponse(BaseModel):
    """Response after creating a ticket"""
    id: UUID
    status: TicketStatus

    model_config = {
        "from_attributes": True
    }


class TicketListItem(BaseModel):
    """Schema for ticket list in dashboard"""
    id: UUID
    email: EmailStr
    category: Optional[TicketCategory] = None
    urgency: Optional[TicketUrgency] = None
    status: TicketStatus
    created_at: datetime  # 👈 TAMBAHAN: untuk sorting dan display
    updated_at: Optional[datetime] = None  # 👈 TAMBAHAN: track last update

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "email": "customer@example.com",
                "category": "technical",
                "urgency": "high",
                "status": "pending",
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-15T11:00:00Z"
            }
        }
    }


class TicketDetailResponse(BaseModel):
    """Schema for detailed ticket view"""
    id: UUID
    email: EmailStr
    message: str
    category: Optional[TicketCategory] = None
    urgency: Optional[TicketUrgency] = None
    sentiment_score: Optional[int] = Field(None, ge=1, le=10)  # 👈 TAMBAHAN: validation
    ai_draft: Optional[str] = None
    status: TicketStatus
    created_at: datetime  # 👈 TAMBAHAN
    updated_at: Optional[datetime] = None  # 👈 TAMBAHAN
    resolved_at: Optional[datetime] = None  # 👈 TAMBAHAN: track resolution time

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "email": "customer@example.com",
                "message": "I can't login to my account",
                "category": "technical",
                "urgency": "high",
                "sentiment_score": 3,
                "ai_draft": "We apologize for the inconvenience...",
                "status": "processed",
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-15T11:00:00Z",
                "resolved_at": None
            }
        }
    }


# =========================
# AI INTERNAL SCHEMA
# =========================
class AITriageResult(BaseModel):
    """Schema for AI triage processing result"""
    category: TicketCategory  # 👈 UBAH: gunakan Enum untuk type safety
    sentiment_score: int = Field(..., ge=1, le=10)
    urgency: TicketUrgency  # 👈 UBAH: gunakan Enum untuk type safety
    draft_reply: str = Field(..., min_length=10)

    model_config = {
        "json_schema_extra": {
            "example": {
                "category": "technical",
                "sentiment_score": 3,
                "urgency": "high",
                "draft_reply": "Thank you for contacting us..."
            }
        }
    }


# =========================
# ADDITIONAL SCHEMAS (OPTIONAL)
# =========================
class TicketStats(BaseModel):
    """Dashboard statistics schema"""
    total_tickets: int = 0
    pending: int = 0
    processed: int = 0
    resolved: int = 0
    error: int = 0
    avg_resolution_time: Optional[float] = None  # in hours

    model_config = {
        "json_schema_extra": {
            "example": {
                "total_tickets": 150,
                "pending": 20,
                "processed": 50,
                "resolved": 75,
                "error": 5,
                "avg_resolution_time": 4.5
            }
        }
    }


class TicketFilter(BaseModel):
    """Query parameters for filtering tickets"""
    status: Optional[TicketStatus] = None
    category: Optional[TicketCategory] = None
    urgency: Optional[TicketUrgency] = None
    email: Optional[EmailStr] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None


class BulkDeleteRequest(BaseModel):
    """Schema for bulk operations"""
    ticket_ids: list[UUID] = Field(..., min_length=1, max_length=100)

    model_config = {
        "json_schema_extra": {
            "example": {
                "ticket_ids": [
                    "123e4567-e89b-12d3-a456-426614174000",
                    "223e4567-e89b-12d3-a456-426614174001"
                ]
            }
        }
    }