from typing import List
from fastapi import APIRouter, Depends, BackgroundTasks, status, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from schemas.ticket import (
    TicketCreate,
    TicketListItem,
    TicketResponse,
    TicketDetailResponse,
    TicketUpdateDraft,
)
from models.ticket import Ticket, TicketStatus
from core.database import get_db
from workers.ticket_processor import process_ticket

router = APIRouter(prefix="/tickets", tags=["Tickets"])


# =========================
# GET LIST (Dashboard)
# =========================
@router.get("", response_model=List[TicketListItem])
async def get_tickets(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Ticket).order_by(Ticket.id.desc())
    )
    return result.scalars().all()


# =========================
# GET DETAIL
# =========================
@router.get("/{ticket_id}", response_model=TicketDetailResponse)
async def get_ticket(
    ticket_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Ticket).where(Ticket.id == ticket_id)
    )
    ticket = result.scalars().first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    return ticket


# =========================
# CREATE (Ingestion API)
# =========================
@router.post("", status_code=status.HTTP_201_CREATED, response_model=TicketResponse)
async def create_ticket(
    payload: TicketCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    ticket = Ticket(
        email=payload.email,
        message=payload.message,
        status=TicketStatus.pending
    )

    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)

    # 🚀 Non-blocking background processing
    background_tasks.add_task(process_ticket, ticket.id)

    return {
        "id": str(ticket.id),
        "status": ticket.status
    }


# =========================
# UPDATE AI DRAFT (Agent Edit)
# =========================
@router.put("/{ticket_id}", response_model=TicketDetailResponse)
async def update_ticket_draft(
    ticket_id: UUID,
    payload: TicketUpdateDraft,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Ticket).where(Ticket.id == ticket_id)
    )
    ticket = result.scalars().first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.ai_draft = payload.ai_draft
    await db.commit()
    await db.refresh(ticket)

    return ticket


# =========================
# RESOLVE TICKET
# =========================
@router.post("/{ticket_id}/resolve", response_model=TicketDetailResponse)
async def resolve_ticket(
    ticket_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Ticket).where(Ticket.id == ticket_id)
    )
    ticket = result.scalars().first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.status = TicketStatus.resolved
    await db.commit()
    await db.refresh(ticket)

    return ticket
