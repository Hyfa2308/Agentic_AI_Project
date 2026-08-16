"""
LangGraph Agent State definition.
Holds the complete state passed between workflow nodes.
"""

from typing import Dict, Any, List, Optional
from typing_extensions import TypedDict


class AgentState(TypedDict, total=False):
    # Customer Request Inputs
    message: str
    customer_id: Optional[str]
    session_id: Optional[str]

    # Analysis Results
    intent: str
    intent_confidence: float
    sentiment: str
    sentiment_confidence: float

    # Retrieved Context & RAG
    customer_context: Dict[str, Any]
    retrieved_knowledge: List[Dict[str, Any]]

    # Priority & Decision
    priority: str  # LOW, MEDIUM, HIGH, CRITICAL
    should_escalate: bool
    escalation_reason: Optional[str]

    # Final Outputs
    ai_response: Optional[str]
    escalation_summary: Optional[Dict[str, Any]]
    ticket_id: Optional[str]
