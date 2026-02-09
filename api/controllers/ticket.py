from typing import List
from fastapi import APIRouter, Depends, BackgroundTasks, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.ticket import TicketCreate, TicketListItem, TicketResponse, TicketDetailResponse
from models.ticket import Ticket
from core.database import get_db
from workers.ticket_processor import process_ticket
from uuid import UUID  

router = APIRouter(prefix="/tickets", tags=["Tickets"])

@router.get("", response_model=List[TicketListItem])
async def get_tickets(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Ticket).order_by(Ticket.id.desc())
    )
    tickets = result.scalars().all()
    return tickets

@router.get("/{ticket_id}", response_model=TicketDetailResponse)
async def get_ticket(
    ticket_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Ticket).where(Ticket.id == ticket_id)
    )
    ticket = result.scalars().first()
    return ticket

@router.post("", status_code=status.HTTP_201_CREATED, response_model=TicketResponse)
async def create_ticket(
    payload: TicketCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    ticket = Ticket(
        email=payload.email,
        message=payload.message
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
