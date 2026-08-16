"""
Intent Agent module.
Determines customer intent and returns structured JSON output.
"""

import logging
from typing import Dict, Any
from app.agents.state import AgentState
from app.services.llm_service import llm_service

logger = logging.getLogger("assistiq")

VALID_INTENTS = [
    "refund",
    "login_problem",
    "payment_issue",
    "order_problem",
    "delivery_issue",
    "account_issue",
    "technical_problem",
    "cancellation",
    "general_question",
]

KEYWORD_INTENT_MAP = {
    "refund": "refund",
    "money back": "refund",
    "return": "refund",
    "login": "login_problem",
    "password": "login_problem",
    "cant sign in": "login_problem",
    "payment": "payment_issue",
    "charge": "payment_issue",
    "card": "payment_issue",
    "billing": "payment_issue",
    "order": "order_problem",
    "tracking": "order_problem",
    "delivery": "delivery_issue",
    "shipping": "delivery_issue",
    "delivered": "delivery_issue",
    "account": "account_issue",
    "profile": "account_issue",
    "error": "technical_problem",
    "bug": "technical_problem",
    "broken": "technical_problem",
    "cancel": "cancellation",
    "unsubscribe": "cancellation",
}


def run_intent_agent(state: AgentState) -> Dict[str, Any]:
    """Execute Intent classification node."""
    message = state.get("message", "")
    logger.info("Executing Intent Agent for message: '%s'", message[:60])

    if llm_service.is_available:
        system_prompt = (
            "You are an Intent Classification Agent for customer support. "
            f"Classify the customer input into ONE of these categories: {VALID_INTENTS}. "
            "Return a JSON object with keys: 'intent' (str) and 'confidence' (float 0.0-1.0)."
        )
        prompt = f"Customer message: \"{message}\""
        result = llm_service.generate_json(prompt, system_prompt)

        intent = result.get("intent", "general_question")
        confidence = float(result.get("confidence", 0.85))

        if intent not in VALID_INTENTS:
            intent = "general_question"

        return {"intent": intent, "intent_confidence": confidence}

    # Keyword fallback
    lower_msg = message.lower()
    detected_intent = "general_question"
    confidence = 0.75

    for kw, target_intent in KEYWORD_INTENT_MAP.items():
        if kw in lower_msg:
            detected_intent = target_intent
            confidence = 0.90
            break

    logger.info("Intent Agent result (rule fallback): %s (conf=%.2f)", detected_intent, confidence)
    return {"intent": detected_intent, "intent_confidence": confidence}
