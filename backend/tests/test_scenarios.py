"""
End-to-End Test Suite for Required Conversational Scenarios.

TEST 1: Greeting ("Hello")
TEST 2: Delivery issue ("My order hasn't arrived.")
TEST 3: Delayed delivery ("My order was supposed to arrive yesterday.")
TEST 4: Duplicate payment ("I was charged twice for the same order.")
TEST 5: Frustrated escalation ("I'm extremely frustrated. I've contacted support three times...")
TEST 6: FAQ RAG query ("What is your refund policy?")
TEST 7: Multi-turn context memory ("My order is late" -> "ORD12345" -> "When will it arrive?")
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_scenario_1_greeting():
    """TEST 1: Greeting responds naturally."""
    res = client.post("/api/chat", json={"message": "Hello"})
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] in ["general_question", "unknown"]
    assert len(data["response"]) > 0


def test_scenario_2_order_delivery_issue():
    """TEST 2: Delivery issue classification."""
    res = client.post("/api/chat", json={"message": "My order hasn't arrived."})
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] in ["delayed_delivery", "order_status"]


def test_scenario_3_delayed_delivery():
    """TEST 3: Order supposed to arrive yesterday."""
    res = client.post("/api/chat", json={"message": "My order was supposed to arrive yesterday."})
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] in ["delayed_delivery", "order_status"]


def test_scenario_4_duplicate_payment_escalation():
    """TEST 4: Duplicate payment dispute triggers escalation."""
    res = client.post("/api/chat", json={"message": "I was charged twice for the same order."})
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] == "duplicate_payment"
    assert data["escalated"] is True
    assert data["ticket_id"] is not None


def test_scenario_5_frustrated_escalation():
    """TEST 5: Frustrated customer with 3 attempts triggers escalation."""
    res = client.post(
        "/api/chat",
        json={"message": "I'm extremely frustrated. I've contacted support three times and nobody helped me."}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["sentiment"] in ["angry", "frustrated"]
    assert data["escalated"] is True


def test_scenario_6_faq_rag_query():
    """TEST 6: FAQ query uses RAG company knowledge."""
    res = client.post("/api/chat", json={"message": "What is your refund policy?"})
    assert res.status_code == 200
    data = res.json()
    assert "refund" in data["response"].lower() or "policy" in data["response"].lower()


def test_scenario_7_multi_turn_anaphora():
    """TEST 7: Multi-turn order query retains context."""
    res1 = client.post("/api/chat", json={"message": "My order is late."})
    conv_id = res1.json()["conversation_id"]

    res2 = client.post("/api/chat", json={"conversation_id": conv_id, "message": "ORD12345"})
    assert res2.status_code == 200

    res3 = client.post("/api/chat", json={"conversation_id": conv_id, "message": "When will it arrive?"})
    assert res3.status_code == 200
    assert res3.json()["conversation_id"] == conv_id
