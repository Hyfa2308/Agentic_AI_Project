"""
Feedback API endpoints.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.ticket import Ticket
from app.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreateRequest, FeedbackResponse

logger = logging.getLogger("assistiq")
router = APIRouter(prefix="/api", tags=["Feedback"])


@router.post("/feedback", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(request: FeedbackCreateRequest, db: Session = Depends(get_db)):
    """Submit customer feedback for a ticket interaction."""
    ticket = db.query(Ticket).filter(Ticket.ticket_id == request.ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {request.ticket_id} not found")

    # Check if feedback already exists for this ticket
    fb = db.query(Feedback).filter(Feedback.ticket_id == request.ticket_id).first()
    if fb:
        fb.rating = request.rating
        fb.comments = request.comments
        fb.resolved_by = request.resolved_by or fb.resolved_by
    else:
        fb = Feedback(
            ticket_id=request.ticket_id,
            rating=request.rating,
            comments=request.comments,
            escalated=ticket.escalated,
            resolved_by=request.resolved_by or ("human" if ticket.escalated else "ai"),
        )
        db.add(fb)

    db.commit()
    db.refresh(fb)
    logger.info("Feedback submitted for ticket %s: rating=%s", request.ticket_id, request.rating)
    return fb
