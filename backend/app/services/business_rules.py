"""
Centralized Business Rules engine.
Calculates ticket priority and escalation recommendations based on sentiment, intent,
customer profile/plan tier, and knowledge availability.
"""

from typing import Dict, Any, Tuple


class BusinessRulesEngine:
    """Configurable rules engine for Priority and Escalation decisions."""

    INTENT_BASE_PRIORITY = {
        "payment_issue": "HIGH",
        "cancellation": "HIGH",
        "refund": "HIGH",
        "login_problem": "MEDIUM",
        "technical_problem": "MEDIUM",
        "account_issue": "MEDIUM",
        "delivery_issue": "MEDIUM",
        "order_problem": "MEDIUM",
        "general_question": "LOW",
    }

    PRIORITY_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

    def calculate_priority(
        self,
        intent: str,
        sentiment: str,
        customer_context: Dict[str, Any] = None,
    ) -> str:
        """Calculate final priority from sentiment, intent, and customer tier."""
        customer_context = customer_context or {}
        base = self.INTENT_BASE_PRIORITY.get(intent.lower(), "MEDIUM")

        current_index = self.PRIORITY_LEVELS.index(base)

        # Sentiment adjustment
        if sentiment in ["angry"]:
            current_index = min(len(self.PRIORITY_LEVELS) - 1, current_index + 2)
        elif sentiment in ["frustrated", "negative"]:
            current_index = min(len(self.PRIORITY_LEVELS) - 1, current_index + 1)

        # Customer plan tier adjustment
        plan = customer_context.get("plan_tier", "standard").lower()
        if plan == "enterprise":
            current_index = min(len(self.PRIORITY_LEVELS) - 1, current_index + 1)

        return self.PRIORITY_LEVELS[current_index]

    def evaluate_escalation(
        self,
        intent: str,
        sentiment: str,
        priority: str,
        knowledge_retrieved: bool = True,
        confidence: float = 0.8,
    ) -> Tuple[bool, str]:
        """Determine if an issue requires human escalation and return the reason."""
        # Rule 1: Angry customer with severe intent -> Escalate
        if sentiment == "angry":
            return True, "Customer is expressing severe anger/frustration."

        # Rule 2: Critical priority -> Escalate
        if priority == "CRITICAL":
            return True, "Ticket identified as CRITICAL priority."

        # Rule 3: High priority payment or cancellation issue -> Escalate
        if intent in ["payment_issue", "cancellation"] and priority in ["HIGH", "CRITICAL"]:
            return True, f"High-risk intent '{intent}' requires human agent verification."

        # Rule 4: No knowledge retrieved or low confidence -> Escalate
        if not knowledge_retrieved:
            return True, "Relevant information not found in Knowledge Base."

        if confidence < 0.5:
            return True, "Low AI confidence in resolving query automatically."

        return False, "Query suitable for automated resolution."


business_rules = BusinessRulesEngine()
