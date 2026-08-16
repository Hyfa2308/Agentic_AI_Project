"""
Feedback & Learning Agent module.
Stores user ratings/outcomes and aggregates system accuracy metrics.
"""

import logging
from typing import Dict, Any
from app.database.connection import SessionLocal
from app.models.feedback import Feedback
from app.models.ticket import Ticket

logger = logging.getLogger("assistiq")


def run_feedback_agent(ticket_id: str, rating: int, comments: str = None) -> Dict[str, Any]:
    """Record customer feedback for learning analytics."""
    logger.info("Feedback Agent recording rating=%d for ticket %s", rating, ticket_id)

    db = SessionLocal()
    try:
        fb = db.query(Feedback).filter(Feedback.ticket_id == ticket_id).first()
        if fb:
            fb.rating = rating
            if comments:
                fb.comments = comments
        else:
            ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
            fb = Feedback(
                ticket_id=ticket_id,
                rating=rating,
                comments=comments,
                escalated=ticket.escalated if ticket else False,
                resolved_by="human" if (ticket and ticket.escalated) else "ai",
            )
            db.add(fb)

        db.commit()
        db.refresh(fb)
        return {
            "status": "success",
            "ticket_id": ticket_id,
            "rating": fb.rating,
        }
    except Exception as e:
        logger.error("Feedback Agent error: %s", e)
        db.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        db.close()
