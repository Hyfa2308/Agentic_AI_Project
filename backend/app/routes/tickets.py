"""
Ticket management API endpoints with SQLAlchemy database integration.
"""

import uuid
import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.ticket import Ticket
from app.models.message import Message
from app.models.customer import Customer
from app.schemas.ticket import (
    TicketCreateRequest,
    TicketUpdateRequest,
    TicketResponse,
    TicketListResponse,
    MessageCreate,
    MessageSchema,
)

logger = logging.getLogger("assistiq")
router = APIRouter(prefix="/api", tags=["Tickets"])


def generate_ticket_id() -> str:
    """Generate a unique human-friendly ticket ID (e.g. TKT-8F3A2B1C)."""
    return f"TKT-{uuid.uuid4().hex[:8].upper()}"


@router.post("/tickets", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(request: TicketCreateRequest, db: Session = Depends(get_db)):
    """Create a new support ticket."""
    ticket_id = generate_ticket_id()

    # Link customer if exists or create dummy
    customer_id = request.customer_id
    if customer_id:
        cust = db.query(Customer).filter(Customer.customer_id == customer_id).first()
        if not cust:
            # Auto-create customer record
            cust = Customer(
                customer_id=customer_id,
                name=request.customer_name,
            )
            db.add(cust)
            db.commit()

    ticket = Ticket(
        ticket_id=ticket_id,
        customer_id=customer_id,
        customer_name=request.customer_name,
        subject=request.subject,
        description=request.description,
        category=request.category or "general_question",
        priority=request.priority or "LOW",
        status="open",
    )
    db.add(ticket)

    # Initial customer message
    msg = Message(
        ticket_id=ticket_id,
        sender="customer",
        message_text=request.description,
    )
    db.add(msg)

    db.commit()
    db.refresh(ticket)
    logger.info("Ticket created: %s for %s", ticket_id, request.customer_name)
    return ticket


@router.get("/tickets", response_model=TicketListResponse)
def list_tickets(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    escalated_filter: Optional[bool] = Query(None, alias="escalated"),
    db: Session = Depends(get_db),
):
    """List all tickets with optional filtering."""
    query = db.query(Ticket)

    if status_filter:
        query = query.filter(Ticket.status == status_filter)
    if priority_filter:
        query = query.filter(Ticket.priority == priority_filter)
    if escalated_filter is not None:
        query = query.filter(Ticket.escalated == escalated_filter)

    query = query.order_by(Ticket.created_at.desc())
    tickets = query.all()
    return TicketListResponse(tickets=tickets, total=len(tickets))


@router.get("/tickets/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: str, db: Session = Depends(get_db)):
    """Get a single ticket by ticket_id."""
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")
    return ticket


@router.patch("/tickets/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    ticket_id: str,
    update_data: TicketUpdateRequest,
    db: Session = Depends(get_db),
):
    """Update ticket status, priority, or human notes."""
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")

    if update_data.status is not None:
        ticket.status = update_data.status
    if update_data.priority is not None:
        ticket.priority = update_data.priority
    if update_data.human_notes is not None:
        ticket.human_notes = update_data.human_notes
    if update_data.escalated is not None:
        ticket.escalated = update_data.escalated

    db.commit()
    db.refresh(ticket)
    logger.info("Ticket %s updated: status=%s, priority=%s", ticket_id, ticket.status, ticket.priority)
    return ticket


@router.post("/tickets/{ticket_id}/messages", response_model=MessageSchema)
def add_message(
    ticket_id: str,
    message_data: MessageCreate,
    db: Session = Depends(get_db),
):
    """Add a message (customer reply or agent response) to a ticket thread."""
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")

    msg = Message(
        ticket_id=ticket_id,
        sender=message_data.sender,
        message_text=message_data.message_text,
    )
    db.add(msg)

    # Update ticket status if human agent replied
    if message_data.sender == "agent" and ticket.status == "open":
        ticket.status = "in_progress"

    db.commit()
    db.refresh(msg)
    return msg
