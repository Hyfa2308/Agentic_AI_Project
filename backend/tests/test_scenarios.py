"""
End-to-End Test Suite for Required Scenarios.

SCENARIO 1: Normal FAQ question → automatically resolve
SCENARIO 2: Frustrated customer with payment problem → high priority
SCENARIO 3: Angry customer with unresolved issue → escalate
SCENARIO 4: Question not in knowledge base → safe fallback / escalation
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_scenario_1_faq_resolve():
    """Scenario 1: FAQ query auto-resolves using retrieved knowledge."""
    res = client.post("/api/chat", json={"message": "What is your refund policy?"})
    assert res.status_code == 200
    data = res.json()
    assert data["escalated"] is False
    assert "30-day" in data["response"].lower() or "refund" in data["response"].lower()


def test_scenario_2_frustrated_payment():
    """Scenario 2: Frustrated payment issue receives high/critical priority."""
    res = client.post("/api/chat", json={"message": "I am frustrated because my payment failed!"})
    assert res.status_code == 200
    data = res.json()
    assert data["priority"] in ["HIGH", "CRITICAL"]


def test_scenario_3_angry_escalation():
    """Scenario 3: Angry customer is escalated and ticket is generated."""
    res = client.post(
        "/api/chat",
        json={"message": "This service is UNACCEPTABLE! Fix my account billing immediately or I will contact my lawyer!"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["escalated"] is True
    assert data["ticket_id"] is not None
    assert "TKT-" in data["ticket_id"]


def test_scenario_4_unknown_query_fallback():
    """Scenario 4: Query not found in knowledge base generates safe response or escalation."""
    res = client.post("/api/chat", json={"message": "Can you assist me with astrophysics quantum calculations?"})
    assert res.status_code == 200
    data = res.json()
    assert data["response"] is not None
    assert len(data["response"]) > 0
