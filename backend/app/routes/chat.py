"""
Chat API endpoint powered by multi-agent LangGraph workflow.
"""

import logging
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.agents.orchestrator import process_chat_message

logger = logging.getLogger("assistiq")
router = APIRouter(prefix="/api", tags=["Chat"])


class ChatRequest(BaseModel):
    message: str
    customer_id: Optional[str] = None
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    ticket_id: Optional[str] = None
    intent: Optional[str] = None
    sentiment: Optional[str] = None
    priority: Optional[str] = None
    escalated: bool = False
    escalation_reason: Optional[str] = None


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process a customer chat message through the complete LangGraph AI agent pipeline."""
    logger.info("Received chat message: '%s' (customer_id=%s)", request.message[:50], request.customer_id)

    try:
        final_state = process_chat_message(
            message=request.message,
            customer_id=request.customer_id,
            session_id=request.session_id,
        )

        return ChatResponse(
            response=final_state.get("ai_response", "Thank you for your message."),
            ticket_id=final_state.get("ticket_id"),
            intent=final_state.get("intent"),
            sentiment=final_state.get("sentiment"),
            priority=final_state.get("priority"),
            escalated=final_state.get("should_escalate", False),
            escalation_reason=final_state.get("escalation_reason"),
        )
    except Exception as e:
        logger.error("Chat pipeline error: %s", e, exc_info=True)
        return ChatResponse(
            response="We are currently experiencing technical difficulties. Your issue has been logged and our support team will assist you.",
            escalated=True,
            escalation_reason="System Exception Fallback",
        )
