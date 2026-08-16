"""
Knowledge Agent module (RAG).
Queries ChromaDB vector store and appends retrieved knowledge chunks to AgentState.
"""

import logging
from typing import Dict, Any
from app.agents.state import AgentState
from app.services.rag_service import rag_service

logger = logging.getLogger("assistiq")


def run_knowledge_agent(state: AgentState) -> Dict[str, Any]:
    """Execute Knowledge Agent (RAG) node."""
    message = state.get("message", "")
    logger.info("Executing Knowledge Agent RAG search for: '%s'", message[:60])

    retrieved = rag_service.query(message, top_k=3)
    logger.info("Knowledge Agent retrieved %d knowledge chunks.", len(retrieved))

    return {"retrieved_knowledge": retrieved}
