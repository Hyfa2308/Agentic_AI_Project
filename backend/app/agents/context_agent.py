"""
Context Agent module.
Fetches customer profile, order history, and previous tickets from PostgreSQL.
"""

import logging
from typing import Dict, Any
from app.agents.state import AgentState
from app.database.connection import SessionLocal
from app.models.customer import Customer
from app.models.ticket import Ticket

logger = logging.getLogger("assistiq")


def run_context_agent(state: AgentState) -> Dict[str, Any]:
    """Execute Context Agent node to pull customer background from DB."""
    customer_id = state.get("customer_id")
    logger.info("Executing Context Agent for customer_id: '%s'", customer_id)

    context = {
        "customer_id": customer_id or "ANONYMOUS",
        "name": "Guest Customer",
        "plan_tier": "standard",
        "previous_tickets_count": 0,
        "recent_tickets": [],
    }

    if not customer_id:
        return {"customer_context": context}

    db = SessionLocal()
    try:
        cust = db.query(Customer).filter(Customer.customer_id == customer_id).first()
        if cust:
            context["name"] = cust.name
            context["plan_tier"] = cust.plan_tier or "standard"

        # Previous tickets
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

    logger.info("Context Agent retrieved context for %s (tier=%s, past_tickets=%d)",
                context["name"], context["plan_tier"], context["previous_tickets_count"])
    return {"customer_context": context}
