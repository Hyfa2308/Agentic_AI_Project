"""
Intent Agent module.
Determines customer intent via LLM semantic classification or rule fallback.
"""

import logging
from typing import Dict, Any
from app.agents.state import AgentState
from app.services.llm_service import llm_service

logger = logging.getLogger("assistiq")

VALID_INTENTS = [
    "order_status",
    "delayed_delivery",
    "cancellation",
    "refund",
    "payment_issue",
    "duplicate_payment",
    "damaged_product",
    "defective_product",
    "account_issue",
    "login_issue",
    "product_information",
    "complaint",
    "technical_support",
    "general_question",
    "unknown",
]

KEYWORD_INTENT_MAP = [
    ("charged twice", "duplicate_payment"),
    ("double charge", "duplicate_payment"),
    ("two times", "duplicate_payment"),
    ("unauthorized", "account_issue"),
    ("hacked", "account_issue"),
    ("security", "account_issue"),
    ("forgot password", "login_issue"),
    ("reset password", "login_issue"),
    ("payment failed", "payment_issue"),
    ("card declined", "payment_issue"),
    ("payment error", "payment_issue"),
    ("account locked", "account_issue"),
    ("locked out", "account_issue"),
    ("refund policy", "general_question"),
    ("refund", "refund"),
    ("money back", "refund"),
    ("order is late", "delayed_delivery"),
    ("hasn't arrived", "delayed_delivery"),
    ("not arrived", "delayed_delivery"),
    ("haven't received", "delayed_delivery"),
    ("supposed to arrive", "delayed_delivery"),
    ("arrive yesterday", "delayed_delivery"),
    ("arrive today", "delayed_delivery"),
    ("still waiting", "delayed_delivery"),
    ("delayed", "delayed_delivery"),
    ("shipping", "delayed_delivery"),
    ("order status", "order_status"),
    ("where is my order", "order_status"),
    ("damaged", "damaged_product"),
    ("defective", "defective_product"),
    ("broken", "damaged_product"),
    ("cancel subscription", "cancellation"),
    ("cancel order", "cancellation"),
    ("cancel", "cancellation"),
    ("cant log in", "login_issue"),
    ("cannot login", "login_issue"),
    ("can't log in", "login_issue"),
    ("login", "login_issue"),
    ("sign in", "login_issue"),
    ("error", "technical_support"),
    ("bug", "technical_support"),
    ("account", "account_issue"),
]


def run_intent_agent(state: AgentState) -> Dict[str, Any]:
    """Execute Intent classification node."""
    message = state.get("message", "")
    conversation_history = state.get("conversation_history", [])
    logger.info("Executing Intent Agent for message: '%s'", message[:60])

    if llm_service.is_available:
        history_summary = ""
        if conversation_history:
            turns = [f"{t.get('role')}: {t.get('content') or t.get('message')}" for t in conversation_history[-3:]]
            history_summary = "Recent Conversation History:\n" + "\n".join(turns) + "\n\n"

        system_prompt = (
            "You are an Intent Classification AI Agent for an enterprise customer support platform. "
            f"Classify the customer input into EXACTLY ONE of these intent categories: {VALID_INTENTS}.\n"
            "Return ONLY a JSON object with keys: 'intent' (str) and 'confidence' (float 0.0-1.0)."
        )
        prompt = f"{history_summary}Latest Customer message: \"{message}\""
        result = llm_service.generate_json(prompt, system_prompt)

        intent = result.get("intent", "general_question")
        confidence = float(result.get("confidence", 0.90))

        if intent not in VALID_INTENTS:
            intent = "general_question"

        logger.info("Intent Agent result (LLM): %s (conf=%.2f)", intent, confidence)
        return {"intent": intent, "intent_confidence": confidence}

    # Deterministic Mock / Rule Fallback
    lower_msg = message.lower()
    detected_intent = "general_question"
    confidence = 0.85

    for kw, target_intent in KEYWORD_INTENT_MAP:
        if kw in lower_msg:
            detected_intent = target_intent
            confidence = 0.95
            break

    logger.info("Intent Agent result (rule fallback): %s (conf=%.2f)", detected_intent, confidence)
    return {"intent": detected_intent, "intent_confidence": confidence}
