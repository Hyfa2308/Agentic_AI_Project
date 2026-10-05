"""
Context Agent module.
Fetches customer profile from database and extracts important entities from conversation history.
Maintains a running context of what information the customer has provided.
"""

import re
import logging
from typing import Dict, Any, List
from app.agents.state import AgentState
from app.database.connection import SessionLocal
from app.models.customer import Customer
from app.models.ticket import Ticket

logger = logging.getLogger("assistiq")

# Regex patterns for entity extraction
ORDER_ID_PATTERN = re.compile(r'\b(ORD[-]?\d{3,})\b', re.IGNORECASE)
TICKET_ID_PATTERN = re.compile(r'\b(TKT[-]?\w{4,}|AI[-]?\w{4,})\b', re.IGNORECASE)
EMAIL_PATTERN = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')


def _extract_entities_from_text(text: str) -> Dict[str, Any]:
    """Extract order IDs, ticket IDs, emails, and other entities from text."""
    entities = {}

    order_ids = ORDER_ID_PATTERN.findall(text)
    if order_ids:
        entities["order_id"] = order_ids[-1].upper()  # Use the most recent one

    ticket_ids = TICKET_ID_PATTERN.findall(text)
    if ticket_ids:
        entities["ticket_id"] = ticket_ids[-1].upper()

    emails = EMAIL_PATTERN.findall(text)
    if emails:
        entities["email"] = emails[-1]

    return entities


def _extract_entities_from_history(
    conversation_history: List[Dict[str, Any]],
    current_message: str,
) -> Dict[str, Any]:
    """
    Extract and accumulate entities from the full conversation.
    Later mentions override earlier ones (handles customer corrections like "Sorry, I meant ORD124").
    """
    all_entities: Dict[str, Any] = {}

    # Scan history chronologically so later values override earlier
    for turn in conversation_history:
        if turn.get("role") == "user":
            content = turn.get("content") or turn.get("message") or ""
            turn_entities = _extract_entities_from_text(content)
            all_entities.update(turn_entities)

    # Current message takes highest priority
    current_entities = _extract_entities_from_text(current_message)
    all_entities.update(current_entities)

    return all_entities


def run_context_agent(state: AgentState) -> Dict[str, Any]:
    """Execute Context Agent node to build comprehensive customer and conversation context."""
    customer_id = state.get("customer_id")
    conversation_id = state.get("conversation_id")
    message = state.get("message", "")
    conversation_history = state.get("conversation_history", [])

    logger.info("Executing Context Agent for customer_id: '%s', conversation_id: '%s'", customer_id, conversation_id)

    context = {
        "customer_id": customer_id or "ANONYMOUS",
        "name": "Guest Customer" if not customer_id else None,
        "plan_tier": "standard",
        "previous_tickets_count": 0,
        "recent_tickets": [],
        "important_entities": {},
        "conversation_turn_count": len(conversation_history) + 1,
    }

    # Extract entities from full conversation
    entities = _extract_entities_from_history(conversation_history, message)
    context["important_entities"] = entities
    if entities.get("order_id"):
        context["order_id"] = entities["order_id"]

    # Fetch customer info and ticket history from DB
    db = SessionLocal()
    try:
        if customer_id:
            cust = db.query(Customer).filter(Customer.customer_id == customer_id).first()
            if cust:
                context["name"] = cust.name
                context["email"] = cust.email
                context["plan_tier"] = cust.plan_tier or "standard"
            else:
                context["name"] = f"Customer ({customer_id})"

            tickets = (
                db.query(Ticket)
                .filter(Ticket.customer_id == customer_id)
                .order_by(Ticket.created_at.desc())
                .limit(3)
                .all()
            )

            context["previous_tickets_count"] = len(tickets)
            context["recent_tickets"] = [
                {
                    "ticket_id": t.ticket_id,
                    "subject": t.subject,
                    "status": t.status,
                    "priority": t.priority,
                }
                for t in tickets
            ]
    except Exception as e:
        logger.warning("Context Agent error fetching DB record: %s", e)
    finally:
        db.close()

    logger.info(
        "Context Agent: customer=%s, entities=%s, turn=%d",
        context.get("name"),
        context.get("important_entities"),
        context.get("conversation_turn_count", 0),
    )
    return {"customer_context": context}
