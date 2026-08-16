"""
LangGraph Orchestrator graph definition.
Coordinates Intent, Sentiment, Context, Knowledge (RAG), Priority, Decision, Response, and Escalation nodes.
"""

import logging
from typing import Dict, Any
from langgraph.graph import StateGraph, END

from app.agents.state import AgentState
from app.agents.intent_agent import run_intent_agent
from app.agents.sentiment_agent import run_sentiment_agent
from app.agents.context_agent import run_context_agent
from app.agents.knowledge_agent import run_knowledge_agent
from app.agents.priority_agent import run_priority_agent
from app.agents.decision_agent import run_decision_agent
from app.agents.response_agent import run_response_agent
from app.agents.escalation_agent import run_escalation_agent

logger = logging.getLogger("assistiq")


def analyze_phase(state: AgentState) -> Dict[str, Any]:
    """Runs parallel analysis: Intent, Sentiment, Context, Knowledge RAG, and Priority."""
    logger.info("--- Orchestrator Phase 1: Context & Knowledge Retrieval ---")
    intent_res = run_intent_agent(state)
    sentiment_res = run_sentiment_agent(state)
    context_res = run_context_agent(state)
    knowledge_res = run_knowledge_agent(state)

    merged = {**intent_res, **sentiment_res, **context_res, **knowledge_res}
    temp_state = {**state, **merged}

    logger.info("--- Orchestrator Phase 2: Priority Evaluation ---")
    priority_res = run_priority_agent(temp_state)
    merged.update(priority_res)

    return merged


def decision_node(state: AgentState) -> Dict[str, Any]:
    """Runs Decision Agent to determine whether to auto-resolve or escalate."""
    logger.info("--- Orchestrator Phase 3: Decision Evaluation ---")
    return run_decision_agent(state)


def route_decision(state: AgentState) -> str:
    """Conditional edge router function."""
    if state.get("should_escalate", False):
        return "escalation_agent"
    return "response_agent"


# Build LangGraph StateGraph
builder = StateGraph(AgentState)

builder.add_node("analyze_phase", analyze_phase)
builder.add_node("decision_node", decision_node)
builder.add_node("response_agent", run_response_agent)
builder.add_node("escalation_agent", run_escalation_agent)

builder.set_entry_point("analyze_phase")
builder.add_edge("analyze_phase", "decision_node")

builder.add_conditional_edges(
    "decision_node",
    route_decision,
    {
        "response_agent": "response_agent",
        "escalation_agent": "escalation_agent",
    },
)

builder.add_edge("response_agent", END)
builder.add_edge("escalation_agent", END)

orchestrator_graph = builder.compile()


def process_chat_message(message: str, customer_id: str = None, session_id: str = None) -> AgentState:
    """Processes a customer chat message through the complete multi-agent LangGraph workflow."""
    initial_state: AgentState = {
        "message": message,
        "customer_id": customer_id,
        "session_id": session_id,
        "customer_context": {},
        "retrieved_knowledge": [],
    }

    final_state = orchestrator_graph.invoke(initial_state)
    return final_state
