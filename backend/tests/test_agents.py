"""
Unit tests for Intent, Sentiment, Priority, and Business Rules.
"""

from app.agents.intent_agent import run_intent_agent
from app.agents.sentiment_agent import run_sentiment_agent
from app.agents.priority_agent import run_priority_agent
from app.services.business_rules import business_rules


def test_intent_agent():
    state = {"message": "I need a refund for my order."}
    res = run_intent_agent(state)
    assert res["intent"] == "refund"
    assert res["intent_confidence"] > 0.5


def test_sentiment_agent():
    state = {"message": "This is completely unacceptable and terrible service!"}
    res = run_sentiment_agent(state)
    assert res["sentiment"] in ["angry", "negative", "frustrated"]


def test_priority_agent():
    state = {
        "intent": "payment_issue",
        "sentiment": "angry",
        "customer_context": {"plan_tier": "enterprise"},
    }
    res = run_priority_agent(state)
    assert res["priority"] in ["HIGH", "CRITICAL"]


def test_business_rules_escalation():
    should_esc, reason = business_rules.evaluate_escalation(
        intent="payment_issue",
        sentiment="angry",
        priority="CRITICAL",
        knowledge_retrieved=True,
    )
    assert should_esc is True
    assert "anger" in reason.lower() or "critical" in reason.lower()
