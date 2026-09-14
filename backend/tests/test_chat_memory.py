"""
Tests for multi-turn conversation memory and session retention.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_multi_turn_conversation_memory():
    """Verify that conversation_id maintains context across consecutive requests."""
    # Turn 1: Initial query
    res1 = client.post("/api/chat", json={"message": "My order is late."})
    assert res1.status_code == 200
    data1 = res1.json()
    conv_id = data1["conversation_id"]
    assert conv_id is not None
    assert conv_id.startswith("CONV-")

    # Turn 2: Providing order number using same conversation_id
    res2 = client.post("/api/chat", json={"conversation_id": conv_id, "message": "My order number is ORD12345."})
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["conversation_id"] == conv_id

    # Turn 3: Anaphoric follow-up query using same conversation_id
    res3 = client.post("/api/chat", json={"conversation_id": conv_id, "message": "When will it arrive?"})
    assert res3.status_code == 200
    data3 = res3.json()
    assert data3["conversation_id"] == conv_id

    # Turn 4: Retrieve chat history endpoint
    res_hist = client.get(f"/api/chat/history/{conv_id}")
    assert res_hist.status_code == 200
    hist_data = res_hist.json()
    assert hist_data["conversation_id"] == conv_id
    assert len(hist_data["messages"]) >= 6  # 3 user messages + 3 assistant responses


def test_empty_message_validation():
    """Verify that sending empty message returns 400 Bad Request."""
    res = client.post("/api/chat", json={"message": "   "})
    assert res.status_code == 400
