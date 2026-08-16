"""
Escalation Agent module.
Generates escalation summary, recommended actions for human support agents, and persists the ticket to PostgreSQL.
"""

import uuid
import logging
from typing import Dict, Any
from app.agents.state import AgentState
from app.database.connection import SessionLocal
from app.models.ticket import Ticket
from app.models.message import Message
from app.services.llm_service import llm_service

logger = logging.getLogger("assistiq")


def run_escalation_agent(state: AgentState) -> Dict[str, Any]:
    """Execute Escalation Agent node."""
    message = state.get("message", "")
    customer_id = state.get("customer_id")
    intent = state.get("intent", "general_question")
    sentiment = state.get("sentiment", "neutral")
    priority = state.get("priority", "HIGH")
    reason = state.get("escalation_reason", "Escalated to human agent.")
    customer_context = state.get("customer_context", {})

    logger.info("Executing Escalation Agent: creating escalated ticket record...")

    ticket_id = f"TKT-{uuid.uuid4().hex[:8].upper()}"
    customer_name = customer_context.get("name", "Customer")

    summary_text = (
        f"Customer '{customer_name}' submitted issue: '{message}'. "
        f"Detected intent: {intent}, sentiment: {sentiment}, priority: {priority}. "
        f"Reason for escalation: {reason}."
    )

    recommended_action = (
        f"1. Review customer history and billing status for '{customer_name}'.\n"
        f"2. Contact customer regarding {intent.replace('_', ' ')}.\n"
        f"3. Apply resolution according to SOP guidelines."
    )

    if llm_service.is_available:
        system_prompt = (
            "You are a Support Escalation Specialist. Create a concise summary for a human support agent "
            "and recommend clear next action steps based on the customer message and issue metadata."
        )
        prompt = (
            f"Customer Message: \"{message}\"\nIntent: {intent}\nSentiment: {sentiment}\n"
            f"Priority: {priority}\nEscalation Reason: {reason}"
        )
        llm_out = llm_service.generate_json(
            prompt,
            system_prompt + " Return JSON with keys 'summary' (str) and 'recommended_action' (str)."
        )
        if llm_out.get("summary"):
            summary_text = llm_out["summary"]
        if llm_out.get("recommended_action"):
            recommended_action = llm_out["recommended_action"]

    # Persist ticket to Database
    db = SessionLocal()
    try:
        ticket = Ticket(
            ticket_id=ticket_id,
            customer_id=customer_id,
            customer_name=customer_name,
            subject=f"[{priority}] {intent.replace('_', ' ').title()} - Escalated",
            description=message,
            category=intent,
            priority=priority,
            status="open",
            intent=intent,
            sentiment=sentiment,
            escalated=True,
            escalation_reason=reason,
            ai_summary=summary_text,
            recommended_action=recommended_action,
        )
        db.add(ticket)

        msg = Message(
            ticket_id=ticket_id,
            sender="customer",
            message_text=message,
        )
        db.add(msg)
        db.commit()
        logger.info("Escalation Agent persisted ticket %s to database.", ticket_id)
    except Exception as e:
        logger.error("Escalation Agent failed to persist ticket: %s", e)
        db.rollback()
    finally:
        db.close()

    ai_response = (
        f"Thank you for your message. Your issue has been escalated to our Human Support Team (Ticket #{ticket_id}). "
        f"An agent will review your request and follow up shortly."
    )

    escalation_summary = {
        "ticket_id": ticket_id,
        "escalation_reason": reason,
        "ai_summary": summary_text,
        "recommended_action": recommended_action,
        "priority": priority,
    }

    return {
        "ticket_id": ticket_id,
        "ai_response": ai_response,
        "escalation_summary": escalation_summary,
    }
