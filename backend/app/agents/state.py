"""
LangGraph Agent State definition.
Holds the complete state passed between workflow nodes.
"""

from typing import Dict, Any, List, Optional
from typing_extensions import TypedDict


class AgentState(TypedDict, total=False):
    # Customer Request & Session Memory
    conversation_id: Optional[str]
    session_id: Optional[str]
    customer_id: Optional[str]
    message: str
    conversation_history: List[Dict[str, Any]]

    # AI Analysis Results
    intent: str
    intent_confidence: float
    sentiment: str
    sentiment_confidence: float

    # Context & Vector Knowledge (RAG)
    customer_context: Dict[str, Any]
    retrieved_knowledge: List[Dict[str, Any]]

    # Business Engine Decision
    priority: str  # LOW, MEDIUM, HIGH, CRITICAL
    should_escalate: bool
    escalation_reason: Optional[str]

    # Final Output Results
    ai_response: Optional[str]
    ticket_id: Optional[str]
    escalation_summary: Optional[Dict[str, Any]]
