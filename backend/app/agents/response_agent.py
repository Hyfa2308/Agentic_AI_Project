"""
Response Agent module.
Generates an accurate, grounded, empathetic response using the LLM Service,
multi-turn conversation history, RAG knowledge, and full agent analysis context.
"""

import logging
from typing import Dict, Any
from app.agents.state import AgentState
from app.services.llm_service import llm_service

logger = logging.getLogger("assistiq")


def run_response_agent(state: AgentState) -> Dict[str, Any]:
    """Execute Response Agent node with complete context."""
    message = state.get("message", "")
    conversation_history = state.get("conversation_history", [])
    conversation_summary = state.get("conversation_summary", "")
    knowledge = state.get("retrieved_knowledge", [])
    customer_context = state.get("customer_context", {})

    agent_analysis = {
        "intent": state.get("intent"),
        "sentiment": state.get("sentiment"),
        "priority": state.get("priority"),
        "should_escalate": state.get("should_escalate", False),
        "escalation_reason": state.get("escalation_reason"),
        "ticket_id": state.get("ticket_id"),
    }

    logger.info("Executing Response Agent for message: '%s'", message[:50])

    ai_response = llm_service.generate_chat_response(
        customer_message=message,
        conversation_history=conversation_history,
        retrieved_knowledge=knowledge,
        customer_context=customer_context,
        agent_analysis=agent_analysis,
        conversation_summary=conversation_summary,
    )

    logger.info("Response Agent generated response of length %d", len(ai_response))
    return {"ai_response": ai_response}
