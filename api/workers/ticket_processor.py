from core.database import AsyncSessionLocal
from models.ticket import Ticket, TicketStatus, Category, Urgency
from services.ai_triage import run_ai_triage
import logging

logger = logging.getLogger(__name__)

def map_category(value: str) -> Category:
    mapping = {
        "billing": Category.billing,
        "technical": Category.technical,
        "feature request": Category.feature,
    }
    return mapping[value.lower()]


def map_urgency(value: str) -> Urgency:
    mapping = {
        "high": Urgency.high,
        "medium": Urgency.medium,
        "low": Urgency.low,
    }
    return mapping[value.lower()]


async def process_ticket(ticket_id):
    async with AsyncSessionLocal() as db:
        ticket = await db.get(Ticket, ticket_id)

        if not ticket:
            return

        try:
            ai_result = await run_ai_triage(ticket.message)

            ticket.category = map_category(ai_result.category)
            ticket.sentiment_score = ai_result.sentiment_score
            ticket.urgency = map_urgency(ai_result.urgency)
            ticket.ai_draft = ai_result.draft_reply
            ticket.status = TicketStatus.processed

        except Exception as e:
            logger.exception("AI processing failed for ticket %s", ticket_id)
            ticket.status = TicketStatus.error
            ticket.ai_draft = (
                "We are reviewing your request and will get back to you shortly."
            )

        await db.commit()
