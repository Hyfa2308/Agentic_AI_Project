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
from app.models.escalation import Escalation
from app.models.analysis import IntentAnalysis, SentimentAnalysis
from app.services.llm_service import llm_service

logger = logging.getLogger("assistiq")


def run_escalation_agent(state: AgentState) -> Dict[str, Any]:
    """Execute Escalation Agent node."""
    message = state.get("message", "")
    customer_id = state.get("customer_id")
    intent = state.get("intent", "general_query")
    sentiment = state.get("sentiment", "neutral")
    priority = state.get("priority", "HIGH")
    reason = state.get("escalation_reason", "Escalated to human support team.")
    customer_context = state.get("customer_context", {})

    logger.info("Executing Escalation Agent: creating escalated ticket record...")

    ticket_id = f"AI-{uuid.uuid4().hex[:4].upper()}"
    customer_name = customer_context.get("name", "Customer")

    summary_text = (
        f"Customer '{customer_name}' submitted complaint regarding '{intent.replace('_', ' ')}': '{message}'. "
        f"Detected sentiment is {sentiment} with {priority} priority. "
        f"Reason for escalation: {reason}."
    )

    recommended_action = (
        f"1. Verify customer account status for '{customer_name}' ({customer_id or 'Guest'}).\n"
        f"2. Inspect recent transactions or logs related to '{intent.replace('_', ' ')}'.\n"
        f"3. Contact customer and follow company SOP for resolution."
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

    # Persist ticket & escalation records to Database
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

        esc = Escalation(
            ticket_id=ticket_id,
            reason=reason,
            priority=priority,
            summary=summary_text,
            recommended_action=recommended_action,
            status="pending",
        )
        db.add(esc)

        intent_rec = IntentAnalysis(
            ticket_id=ticket_id,
            intent=intent,
            confidence=state.get("intent_confidence", 0.88),
        )
        db.add(intent_rec)

        sent_rec = SentimentAnalysis(
            ticket_id=ticket_id,
            sentiment=sentiment,
            score=state.get("sentiment_confidence", 0.88),
        )
        db.add(sent_rec)

        db.commit()
        logger.info("Escalation Agent persisted ticket %s and analysis records to database.", ticket_id)
    except Exception as e:
        logger.error("Escalation Agent failed to persist records: %s", e)
        db.rollback()
    finally:
        db.close()

    ai_response = (
        f"I understand this requires further assistance. I've escalated your issue to our support team. "
        f"Your ticket ID is {ticket_id}."
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
