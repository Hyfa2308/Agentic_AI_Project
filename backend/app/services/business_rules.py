"""
Centralized Business Rules engine.
Calculates ticket priority and escalation recommendations based on sentiment, intent,
customer profile/plan tier, and knowledge availability.
"""

from typing import Dict, Any, Tuple


class BusinessRulesEngine:
    """Configurable rules engine for Priority and Escalation decisions."""

    INTENT_BASE_PRIORITY = {
        "security_issue": "CRITICAL",
        "duplicate_payment": "HIGH",
        "payment_issue": "HIGH",
        "complaint": "HIGH",
        "refund": "MEDIUM",
        "cancellation": "MEDIUM",
        "damaged_product": "MEDIUM",
        "defective_product": "MEDIUM",
        "delayed_delivery": "MEDIUM",
        "account_issue": "MEDIUM",
        "technical_support": "MEDIUM",
        "login_issue": "LOW",
        "order_status": "LOW",
        "product_information": "LOW",
        "general_question": "LOW",
        "unknown": "LOW",
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
        elif sentiment in ["frustrated", "disappointed", "urgent"]:
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
        # Rule 1: Security compromise -> Mandatory Immediate Escalation
        if intent == "security_issue":
            return True, "Security compromise alert requires immediate human agent intervention."

        # Rule 2: Duplicate charge dispute or severe complaint -> Mandatory Escalation
        if intent in ["duplicate_payment", "complaint"]:
            return True, f"Billing dispute or formal complaint '{intent}' requires human agent verification."

        if intent in ["refund", "payment_issue"] and priority in ["HIGH", "CRITICAL"] and sentiment in ["angry", "frustrated", "disappointed"]:
            return True, f"High-risk payment issue '{intent}' with {sentiment} sentiment requires support verification."

        # Rule 3: Angry customer -> Escalation
        if sentiment == "angry":
            return True, "Customer is expressing severe anger or frustration."

        # Rule 3b: Frustrated customer with high severity -> Escalation
        if sentiment == "frustrated" and priority in ["HIGH", "CRITICAL"]:
            return True, "Customer is frustrated with elevated priority — requires human intervention."

        # Rule 4: Critical priority -> Escalation
        if priority == "CRITICAL":
            return True, "Ticket identified as CRITICAL priority level."

        # Rule 5: No knowledge retrieved for non-greeting queries -> Escalation
        if not knowledge_retrieved and intent not in ["general_question", "login_issue", "order_status"]:
            return True, "No matching knowledge base article found for technical/billing inquiry."

        if confidence < 0.4:
            return True, "AI confidence score is below threshold for automated resolution."

        return False, "Query suitable for automated AI resolution."


business_rules = BusinessRulesEngine()
