"""
Decision Agent module.
Evaluates sentiment, intent, priority, retrieved knowledge, and business rules to decide:
Auto-resolve OR Escalate to human support.
"""

import logging
from typing import Dict, Any
from app.agents.state import AgentState
from app.services.business_rules import business_rules

logger = logging.getLogger("assistiq")


def run_decision_agent(state: AgentState) -> Dict[str, Any]:
    """Execute Decision Agent node."""
    intent = state.get("intent", "general_question")
    sentiment = state.get("sentiment", "neutral")
    priority = state.get("priority", "LOW")
    knowledge = state.get("retrieved_knowledge", [])
    intent_confidence = state.get("intent_confidence", 0.8)

    logger.info("Executing Decision Agent: intent=%s, sentiment=%s, priority=%s, knowledge_chunks=%d",
                intent, sentiment, priority, len(knowledge))

    has_knowledge = len(knowledge) > 0

    should_escalate, reason = business_rules.evaluate_escalation(
        intent=intent,
        sentiment=sentiment,
        priority=priority,
        knowledge_retrieved=has_knowledge,
        confidence=intent_confidence,
    )

    logger.info("Decision Agent decision: should_escalate=%s (reason: '%s')", should_escalate, reason)

    return {
        "should_escalate": should_escalate,
        "escalation_reason": reason,
    }
