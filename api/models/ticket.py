import uuid
from sqlalchemy import String, Text, Enum, Integer
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

class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255))
    message: Mapped[str] = mapped_column(Text)

    category: Mapped[Category | None] = mapped_column(Enum(Category), nullable=True)
    sentiment_score: Mapped[int | None] = mapped_column(Integer)
    urgency: Mapped[Urgency | None] = mapped_column(Enum(Urgency))

    ai_draft: Mapped[str | None] = mapped_column(Text)
    status: Mapped[TicketStatus] = mapped_column(
        Enum(TicketStatus), default=TicketStatus.pending
    )
