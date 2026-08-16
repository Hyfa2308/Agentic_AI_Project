"""
Priority Agent module.
Calculates ticket priority based on sentiment, intent, customer profile, and business rules.
"""

import logging
from typing import Dict, Any
from app.agents.state import AgentState
from app.services.business_rules import business_rules

logger = logging.getLogger("assistiq")


def run_priority_agent(state: AgentState) -> Dict[str, Any]:
    """Execute Priority Agent node."""
    intent = state.get("intent", "general_question")
    sentiment = state.get("sentiment", "neutral")
    customer_context = state.get("customer_context", {})

    logger.info("Executing Priority Agent with intent='%s', sentiment='%s'", intent, sentiment)

    priority = business_rules.calculate_priority(
        intent=intent,
        sentiment=sentiment,
        customer_context=customer_context,
    )

    logger.info("Priority Agent calculated priority level: %s", priority)
    return {"priority": priority}
