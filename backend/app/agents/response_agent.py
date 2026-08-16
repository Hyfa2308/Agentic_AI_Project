"""
Response Agent module.
Generates an accurate, grounded, empathetic response for auto-resolved tickets using retrieved knowledge.
"""

import logging
from typing import Dict, Any
from app.agents.state import AgentState
from app.services.llm_service import llm_service

logger = logging.getLogger("assistiq")


def run_response_agent(state: AgentState) -> Dict[str, Any]:
    """Execute Response Agent node."""
    message = state.get("message", "")
    intent = state.get("intent", "general_question")
    sentiment = state.get("sentiment", "neutral")
    knowledge = state.get("retrieved_knowledge", [])

    logger.info("Executing Response Agent for message: '%s'", message[:50])

    # Format knowledge context
    kb_context_text = "\n\n".join([f"[{k.get('source', 'KB')}]: {k.get('content', '')}" for k in knowledge])

    if llm_service.is_available:
        system_prompt = (
            "You are an empathetic, professional AI Customer Support Agent for AssistIQ. "
            "Use the provided Knowledge Base Context to answer the user's question accurately. "
            "Do NOT invent company policies, price tags, or non-existent guarantees beyond the context. "
            f"\n\n--- Knowledge Base Context ---\n{kb_context_text}"
        )
        prompt = f"Customer Query: \"{message}\"\nSentiment: {sentiment}\nIntent: {intent}"
        ai_response = llm_service.generate_text(prompt, system_prompt)
        return {"ai_response": ai_response}

    # Grounded rule template fallback when LLM API key is not set
    if knowledge:
        top_k = knowledge[0]
        content_preview = top_k.get("content", "").replace("#", "").strip()
        ai_response = (
            f"Thank you for contacting AssistIQ support! Based on our documentation:\n\n"
            f"{content_preview}\n\n"
            f"If you need any further details, please let us know!"
        )
    else:
        ai_response = (
            "Thank you for reaching out to AssistIQ Support. "
            "We have received your query regarding your account and our team is ready to help you."
        )

    logger.info("Response Agent generated response of length %d", len(ai_response))
    return {"ai_response": ai_response}
