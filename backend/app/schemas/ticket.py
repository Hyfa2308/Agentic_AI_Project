"""
Pydantic schemas for tickets, messages, and ticket operations.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class MessageSchema(BaseModel):
    id: Optional[int] = None
    ticket_id: str
    sender: str
    message_text: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class MessageCreate(BaseModel):
    sender: str  # customer, agent, ai
    message_text: str


class TicketCreateRequest(BaseModel):
    customer_name: str
    customer_id: Optional[str] = None
    subject: str
    description: str
    category: Optional[str] = None
    priority: Optional[str] = "LOW"


class TicketUpdateRequest(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    human_notes: Optional[str] = None
    escalated: Optional[bool] = None


class TicketResponse(BaseModel):
    ticket_id: str
    customer_name: str
    customer_id: Optional[str] = None
    subject: str
    description: str
    category: Optional[str] = None
    status: str = "open"
    priority: Optional[str] = "LOW"
    intent: Optional[str] = None
    sentiment: Optional[str] = None
    escalated: bool = False
    escalation_reason: Optional[str] = None
    ai_summary: Optional[str] = None
    recommended_action: Optional[str] = None
    human_notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TicketListResponse(BaseModel):
    tickets: List[TicketResponse]
    total: int
