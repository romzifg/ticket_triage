from datetime import datetime
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


@router.get("", response_model=List[TicketListItem])
async def get_tickets(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Ticket).order_by(Ticket.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{ticket_id}", response_model=TicketDetailResponse)
async def get_ticket(ticket_id: UUID, db: AsyncSession = Depends(get_db)):
    ticket = await db.get(Ticket, ticket_id)

    if not ticket:
        raise HTTPException(404, "Ticket not found")

    return ticket


@router.post("", status_code=status.HTTP_201_CREATED, response_model=TicketResponse)
async def create_ticket(
    payload: TicketCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    ticket = Ticket(
        email=payload.email,
        message=payload.message,
        status=TicketStatus.pending,
    )

    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)

    background_tasks.add_task(process_ticket, ticket.id)

    return {
        "id": ticket.id,
        "status": ticket.status,
    }


@router.patch("/{ticket_id}/draft", response_model=TicketDetailResponse)
async def update_ticket_draft(
    ticket_id: UUID,
    payload: TicketUpdateDraft,
    db: AsyncSession = Depends(get_db),
):
    ticket = await db.get(Ticket, ticket_id)

    if not ticket:
        raise HTTPException(404, "Ticket not found")

    ticket.ai_draft = payload.ai_draft
    ticket.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(ticket)

    return ticket


@router.patch("/{ticket_id}/resolve", response_model=TicketDetailResponse)
async def resolve_ticket(ticket_id: UUID, db: AsyncSession = Depends(get_db)):
    ticket = await db.get(Ticket, ticket_id)

    if not ticket:
        raise HTTPException(404, "Ticket not found")

    if ticket.status == TicketStatus.resolved:
        raise HTTPException(400, "Ticket already resolved")

    ticket.status = TicketStatus.resolved
    ticket.resolved_at = datetime.utcnow()
    ticket.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(ticket)

    return ticket


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ticket(
    ticket_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a ticket permanently
    """
    result = await db.execute(
        select(Ticket).where(Ticket.id == ticket_id)
    )
    ticket = result.scalars().first()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket with ID {ticket_id} not found"
        )

    await db.delete(ticket)
    await db.commit()

    return None

@router.put("/{ticket_id}/reopen", response_model=TicketDetailResponse)
async def reopen_ticket(
    ticket_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Reopen a resolved ticket
    """
    result = await db.execute(
        select(Ticket).where(Ticket.id == ticket_id)
    )
    ticket = result.scalars().first()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket with ID {ticket_id} not found"
        )

    if ticket.status != TicketStatus.resolved:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only resolved tickets can be reopened"
        )

    ticket.status = TicketStatus.pending
    
    await db.commit()
    await db.refresh(ticket)

    return ticket