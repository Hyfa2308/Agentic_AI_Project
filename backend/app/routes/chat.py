"""
Chat API endpoints powered by multi-agent LangGraph workflow and conversation memory.
"""

import uuid
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.message import Message
from app.models.conversation import Conversation
from app.agents.orchestrator import process_chat_message

logger = logging.getLogger("assistiq")
router = APIRouter(prefix="/api", tags=["Chat"])


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    session_id: Optional[str] = None
    customer_id: Optional[str] = None


class ChatResponse(BaseModel):
    conversation_id: str
    response: str
    intent: Optional[str] = None
    sentiment: Optional[str] = None
    priority: Optional[str] = None
    escalated: bool = False
    ticket_id: Optional[str] = None
    escalation_reason: Optional[str] = None


class ChatHistoryItem(BaseModel):
    sender: str
    message: str
    timestamp: str


class ChatHistoryResponse(BaseModel):
    conversation_id: str
    messages: List[ChatHistoryItem]


def _get_or_create_conversation_id(req: ChatRequest) -> str:
    conv_id = req.conversation_id or req.session_id
    if not conv_id or conv_id.strip() == "":
        conv_id = f"CONV-{uuid.uuid4().hex[:8].upper()}"
    return conv_id


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """Process a customer chat message through the multi-agent LangGraph AI pipeline with conversation memory."""
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    conv_id = _get_or_create_conversation_id(request)
    logger.info("Received chat message for conv_id '%s': '%s'", conv_id, request.message[:50])

    try:
        # 1. Register/Ensure Conversation record in DB
        conv = db.query(Conversation).filter(Conversation.conversation_id == conv_id).first()
        if not conv:
            conv = Conversation(
                conversation_id=conv_id,
                customer_id=request.customer_id,
                status="active",
            )
            db.add(conv)
            db.commit()

        # 2. Fetch past conversation message history for this conversation_id
        db_messages = (
            db.query(Message)
            .filter(Message.ticket_id == conv_id)
            .order_by(Message.created_at.asc())
            .all()
        )

        conversation_history: List[Dict[str, Any]] = [
            {
                "role": "user" if m.sender == "customer" else "assistant",
                "content": m.message_text,
                "timestamp": m.created_at.isoformat() if m.created_at else "",
            }
            for m in db_messages
        ]

        # 3. Store incoming customer user message in DB
        user_msg = Message(
            ticket_id=conv_id,
            sender="customer",
            message_text=request.message,
        )
        db.add(user_msg)
        db.commit()

        # 4. Invoke LangGraph multi-agent orchestrator with full context & history
        final_state = process_chat_message(
            message=request.message,
            customer_id=request.customer_id,
            session_id=conv_id,
            conversation_id=conv_id,
            conversation_history=conversation_history,
        )

        response_text = final_state.get("ai_response") or "Thank you for your message."

        # 5. Store AI assistant response message in DB
        ai_msg = Message(
            ticket_id=conv_id,
            sender="assistant",
            message_text=response_text,
        )
        db.add(ai_msg)

        if final_state.get("should_escalate"):
            conv.status = "escalated"

        db.commit()

        return ChatResponse(
            conversation_id=conv_id,
            response=response_text,
            ticket_id=final_state.get("ticket_id"),
            intent=final_state.get("intent"),
            sentiment=final_state.get("sentiment"),
            priority=final_state.get("priority"),
            escalated=final_state.get("should_escalate", False),
            escalation_reason=final_state.get("escalation_reason"),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Chat pipeline error: %s", e, exc_info=True)
        return ChatResponse(
            conversation_id=conv_id,
            response="We are currently experiencing technical difficulties. Your issue has been logged and our support team will assist you.",
            escalated=True,
            escalation_reason="System Exception Fallback",
        )


@router.get("/chat/history/{conversation_id}", response_model=ChatHistoryResponse)
def get_chat_history(conversation_id: str, db: Session = Depends(get_db)):
    """Retrieve conversation message history for a given conversation_id."""
    messages = (
        db.query(Message)
        .filter(Message.ticket_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    return ChatHistoryResponse(
        conversation_id=conversation_id,
        messages=[
            ChatHistoryItem(
                sender=m.sender,
                message=m.message_text,
                timestamp=m.created_at.isoformat() if m.created_at else "",
            )
            for m in messages
        ],
    )
