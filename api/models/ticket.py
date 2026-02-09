import uuid
from datetime import datetime
from sqlalchemy import String, Text, Enum, Integer, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column
from core.database import Base
import enum


class TicketStatus(str, enum.Enum):
    pending = "pending"
    processed = "processed"
    resolved = "resolved"
    error = "error"


class Urgency(str, enum.Enum):
    high = "high"
    medium = "medium"
    low = "low"


class Category(str, enum.Enum):
    billing = "billing"
    technical = "technical"
    feature = "feature"
    general = "general"


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, 
        default=uuid.uuid4,
        index=True
    )

    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)

    category: Mapped[Category | None] = mapped_column(
        Enum(Category), 
        nullable=True,
        index=True
    )
    sentiment_score: Mapped[int | None] = mapped_column(
        Integer, 
        nullable=True
    )
    urgency: Mapped[Urgency | None] = mapped_column(
        Enum(Urgency), 
        nullable=True,
        index=True
    )

    ai_draft: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[TicketStatus] = mapped_column(
        Enum(TicketStatus), 
        default=TicketStatus.pending,
        nullable=False,
        index=True
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=True
    )
    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    __table_args__ = (
        Index('idx_status_created', 'status', 'created_at'),
        Index('idx_urgency_status', 'urgency', 'status'),
    )

    def __repr__(self):
        return f"<Ticket(id={self.id}, email={self.email}, status={self.status})>"

    def mark_as_resolved(self):
        """Mark ticket as resolved with timestamp"""
        self.status = TicketStatus.resolved
        self.resolved_at = datetime.utcnow()

    def is_pending(self) -> bool:
        return self.status == TicketStatus.pending

    def is_high_priority(self) -> bool:
        return self.urgency == Urgency.high