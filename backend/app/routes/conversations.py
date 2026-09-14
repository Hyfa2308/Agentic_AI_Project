"""
Conversations API endpoints for retrieving conversation session details and message history.
"""

import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.conversation import Conversation
from app.models.message import Message

logger = logging.getLogger("assistiq")
router = APIRouter(prefix="/api", tags=["Conversations"])


class MessageDetailSchema(BaseModel):
    id: int
    sender: str
    message_text: str
    created_at: str

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    conversation_id: str
    customer_id: Optional[str]
    status: str
    created_at: str
    messages: List[MessageDetailSchema]


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation_history(conversation_id: str, db: Session = Depends(get_db)):
    """Fetch complete conversation history by conversation_id."""
    conv = db.query(Conversation).filter(Conversation.conversation_id == conversation_id).first()

    # Search messages matching conversation_id or ticket_id
    messages = (
        db.query(Message)
        .filter((Message.ticket_id == conversation_id))
        .order_by(Message.created_at.asc())
        .all()
    )

    if not conv and not messages:
        raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} not found")

    return ConversationResponse(
        conversation_id=conversation_id,
        customer_id=conv.customer_id if conv else None,
        status=conv.status if conv else "active",
        created_at=conv.created_at.isoformat() if conv and conv.created_at else "",
        messages=[
            MessageDetailSchema(
                id=m.id,
                sender=m.sender,
                message_text=m.message_text,
                created_at=m.created_at.isoformat() if m.created_at else "",
            )
            for m in messages
        ],
    )
