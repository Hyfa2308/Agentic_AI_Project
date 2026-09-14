"""
Context Agent module.
Fetches customer profile, order details, and previous conversation history / tickets from database.
"""

import logging
from typing import Dict, Any
from app.agents.state import AgentState
from app.database.connection import SessionLocal
from app.models.customer import Customer
from app.models.ticket import Ticket
from app.models.message import Message

logger = logging.getLogger("assistiq")


def run_context_agent(state: AgentState) -> Dict[str, Any]:
    """Execute Context Agent node to pull customer background and history from DB."""
    customer_id = state.get("customer_id")
    conversation_id = state.get("conversation_id")
    logger.info("Executing Context Agent for customer_id: '%s', conversation_id: '%s'", customer_id, conversation_id)

    context = {
        "customer_id": customer_id or "ANONYMOUS",
        "name": "Guest Customer" if not customer_id else None,
        "plan_tier": "standard",
        "previous_tickets_count": 0,
        "recent_tickets": [],
        "conversation_history_loaded": False,
    }

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

        # Check existing messages for conversation_id if available
        if conversation_id:
            msg_count = db.query(Message).filter(Message.ticket_id == conversation_id).count()
            if msg_count > 0:
                context["conversation_history_loaded"] = True

    except Exception as e:
        logger.warning("Context Agent error fetching DB record: %s", e)
    finally:
        db.close()

    logger.info(
        "Context Agent retrieved context for customer_id=%s (name=%s, past_tickets=%d)",
        context["customer_id"],
        context.get("name"),
        context["previous_tickets_count"],
    )
    return {"customer_context": context}
