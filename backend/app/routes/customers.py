"""
Customers API endpoints for fetching customer history, tier details, and past tickets.
"""

import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.customer import Customer
from app.models.ticket import Ticket
from app.models.message import Message

logger = logging.getLogger("assistiq")
router = APIRouter(prefix="/api", tags=["Customers"])


class TicketSummarySchema(BaseModel):
    ticket_id: str
    subject: str
    category: Optional[str]
    priority: str
    status: str
    created_at: str

    class Config:
        from_attributes = True


class CustomerHistoryResponse(BaseModel):
    customer_id: str
    name: str
    email: Optional[str]
    plan_tier: str
    total_tickets: int
    tickets: List[TicketSummarySchema]


@router.get("/customers/{customer_id}/history", response_model=CustomerHistoryResponse)
def get_customer_history(customer_id: str, db: Session = Depends(get_db)):
    """Fetch profile and past ticket history for a customer."""
    cust = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    if not cust:
        # Create a default guest response if not found
        tickets = (
            db.query(Ticket)
            .filter(Ticket.customer_id == customer_id)
            .order_by(Ticket.created_at.desc())
            .all()
        )
        return CustomerHistoryResponse(
            customer_id=customer_id,
            name="Guest Customer",
            email=None,
            plan_tier="standard",
            total_tickets=len(tickets),
            tickets=[
                TicketSummarySchema(
                    ticket_id=t.ticket_id,
                    subject=t.subject,
                    category=t.category,
                    priority=t.priority,
                    status=t.status,
                    created_at=t.created_at.isoformat() if t.created_at else "",
                )
                for t in tickets
            ],
        )

    tickets = (
        db.query(Ticket)
        .filter(Ticket.customer_id == customer_id)
        .order_by(Ticket.created_at.desc())
        .all()
    )

    return CustomerHistoryResponse(
        customer_id=cust.customer_id,
        name=cust.name,
        email=cust.email,
        plan_tier=cust.plan_tier or "standard",
        total_tickets=len(tickets),
        tickets=[
            TicketSummarySchema(
                ticket_id=t.ticket_id,
                subject=t.subject,
                category=t.category,
                priority=t.priority,
                status=t.status,
                created_at=t.created_at.isoformat() if t.created_at else "",
            )
            for t in tickets
        ],
    )
