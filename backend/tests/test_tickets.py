"""
Unit tests for Ticket API CRUD operations.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_create_and_get_ticket():
    payload = {
        "customer_name": "Test User",
        "customer_id": "CUST-TEST-01",
        "subject": "Unit Test Issue",
        "description": "This is a test description for ticket creation.",
        "category": "technical_problem",
    }
    response = client.post("/api/tickets", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "ticket_id" in data
    ticket_id = data["ticket_id"]
    assert data["customer_name"] == "Test User"
    assert data["status"] == "open"

    # Get single ticket
    get_res = client.get(f"/api/tickets/{ticket_id}")
    assert get_res.status_code == 200
    assert get_res.json()["ticket_id"] == ticket_id


def test_list_tickets():
    response = client.get("/api/tickets")
    assert response.status_code == 200
    data = response.json()
    assert "tickets" in data
    assert "total" in data
