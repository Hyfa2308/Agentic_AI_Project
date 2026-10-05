"""
Intent Agent module.
Determines customer intent via LLM semantic classification or rule fallback.
Uses full conversation context so follow-up messages are correctly classified.
"""

import logging
from typing import Dict, Any
from app.agents.state import AgentState
from app.services.llm_service import llm_service

logger = logging.getLogger("assistiq")

VALID_INTENTS = [
    "greeting",
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

# Keyword rules for mock/fallback mode
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
    ("where is my package", "order_status"),
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
    ("contacted support", "complaint"),
    ("nobody helped", "complaint"),
    ("no one helped", "complaint"),
    ("three times", "complaint"),
    ("multiple times", "complaint"),
    ("several times", "complaint"),
    ("unacceptable", "complaint"),
    ("terrible service", "complaint"),
    ("horrible service", "complaint"),
    ("error", "technical_support"),
    ("bug", "technical_support"),
    ("account", "account_issue"),
]

# Greeting patterns for mock mode
GREETING_PATTERNS = [
    "hello", "hi", "hey", "good morning", "good afternoon",
    "good evening", "howdy", "greetings", "what's up", "sup",
]


def run_intent_agent(state: AgentState) -> Dict[str, Any]:
    """Execute Intent classification node using conversation context."""
    message = state.get("message", "")
    conversation_history = state.get("conversation_history", [])
    logger.info("Executing Intent Agent for message: '%s'", message[:60])

    if llm_service.is_available:
        # Build full conversation context for the LLM
        history_text = ""
        if conversation_history:
            turns = []
            for t in conversation_history[-6:]:  # Last 6 turns for context
                role = t.get("role", "user")
                content = t.get("content") or t.get("message") or ""
                role_label = "Customer" if role == "user" else "Assistant"
                turns.append(f"{role_label}: {content}")
            history_text = "Conversation History:\n" + "\n".join(turns) + "\n\n"

        system_prompt = (
            "You are an Intent Classification Agent for an enterprise customer support platform.\n"
            "You MUST consider the full conversation history to understand follow-up messages.\n"
            "For example, if the customer previously discussed a late order and now says 'When will it arrive?', "
            "the intent is 'delayed_delivery' or 'order_status', NOT 'general_question'.\n"
            "If the customer says 'Hi' or 'Hello' without any support issue, classify as 'greeting'.\n\n"
            f"Valid intent categories: {VALID_INTENTS}\n\n"
            "Return ONLY a JSON object with keys: 'intent' (str) and 'confidence' (float 0.0-1.0)."
        )
        prompt = f"{history_text}Latest Customer message: \"{message}\""
        result = llm_service.generate_json(prompt, system_prompt)

        intent = result.get("intent", "general_question")
        confidence = float(result.get("confidence", 0.90))

        if intent not in VALID_INTENTS:
            intent = "general_question"

        logger.info("Intent Agent result (LLM): %s (conf=%.2f)", intent, confidence)
        return {"intent": intent, "intent_confidence": confidence}

    # ── Deterministic Mock / Rule Fallback ──
    lower_msg = message.lower().strip()

    # Check greetings first
    if any(lower_msg == g or lower_msg.startswith(g + " ") or lower_msg.startswith(g + "!") or lower_msg.startswith(g + ",") for g in GREETING_PATTERNS):
        logger.info("Intent Agent result (rule fallback): greeting (conf=0.95)")
        return {"intent": "greeting", "intent_confidence": 0.95}

    # For follow-up messages, check conversation context
    detected_intent = "general_question"
    confidence = 0.85

    # If the message is short and there's conversation history, infer from history
    if len(lower_msg.split()) <= 5 and conversation_history:
        # Check if previous messages had a clear topic
        for prev_msg in reversed(conversation_history[-4:]):
            prev_content = (prev_msg.get("content") or prev_msg.get("message") or "").lower()
            prev_role = prev_msg.get("role", "user")
            if prev_role == "user":
                for kw, target_intent in KEYWORD_INTENT_MAP:
                    if kw in prev_content:
                        detected_intent = target_intent
                        confidence = 0.88
                        break
            if detected_intent != "general_question":
                break

    # Direct keyword matching on current message
    for kw, target_intent in KEYWORD_INTENT_MAP:
        if kw in lower_msg:
            detected_intent = target_intent
            confidence = 0.95
            break

    logger.info("Intent Agent result (rule fallback): %s (conf=%.2f)", detected_intent, confidence)
    return {"intent": detected_intent, "intent_confidence": confidence}
