"""
Database initialization script.
Creates tables and populates seed data (sample customers, tickets, conversations, feedback, and knowledge docs).
"""

import logging
from datetime import datetime, timedelta
from app.database.connection import engine, Base, SessionLocal
from app.models.customer import Customer
from app.models.ticket import Ticket
from app.models.message import Message
from app.models.conversation import Conversation
from app.models.feedback import Feedback
from app.models.analysis import IntentAnalysis, SentimentAnalysis

logger = logging.getLogger("assistiq")


def init_db():
    """Create tables and seed initial demo data."""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Seed customers
        if db.query(Customer).count() == 0:
            logger.info("Seeding demo customers...")
            seed_customers = [
                Customer(
                    customer_id="CUST-1001",
                    name="John Doe",
                    email="john.doe@example.com",
                    phone="+1-555-0101",
                    plan_tier="standard",
                ),
                Customer(
                    customer_id="CUST-1002",
                    name="Jane Smith",
                    email="jane.smith@example.com",
                    phone="+1-555-0102",
                    plan_tier="enterprise",
                ),
                Customer(
                    customer_id="CUST-1003",
                    name="Alice Johnson",
                    email="alice.j@example.com",
                    phone="+1-555-0103",
                    plan_tier="premium",
                ),
                Customer(
                    customer_id="CUST-1004",
                    name="Michael Brown",
                    email="michael.b@techcorp.io",
                    phone="+1-555-0104",
                    plan_tier="enterprise",
                ),
                Customer(
                    customer_id="CUST-1005",
                    name="Sarah Wilson",
                    email="sarah.w@designstudio.com",
                    phone="+1-555-0105",
                    plan_tier="standard",
                ),
            ]
            db.add_all(seed_customers)
            db.commit()

        # 2. Seed tickets
        if db.query(Ticket).count() == 0:
            logger.info("Seeding demo tickets...")
            seed_tickets = [
                Ticket(
                    ticket_id="TKT-1001",
                    customer_name="Jane Smith",
                    customer_id="CUST-1002",
                    subject="Duplicate Payment Charge - Order #ORD5921",
                    description="I was charged twice for order ORD5921. Please issue a refund for the duplicate transaction immediately.",
                    category="billing",
                    status="open",
                    priority="HIGH",
                    intent="duplicate_payment",
                    sentiment="angry",
                    escalation_reason="Billing dispute with angry sentiment from Enterprise client.",
                    created_at=datetime.utcnow() - timedelta(hours=3),
                ),
                Ticket(
                    ticket_id="TKT-1002",
                    customer_name="Michael Brown",
                    customer_id="CUST-1004",
                    subject="Delayed Delivery past guaranteed date",
                    description="Order #ORD8821 was supposed to arrive 3 days ago. No tracking updates available.",
                    category="logistics",
                    status="in_progress",
                    priority="CRITICAL",
                    intent="delayed_delivery",
                    sentiment="frustrated",
                    escalation_reason="Guaranteed delivery breach for Enterprise client.",
                    created_at=datetime.utcnow() - timedelta(hours=6),
                ),
                Ticket(
                    ticket_id="TKT-1003",
                    customer_name="John Doe",
                    customer_id="CUST-1001",
                    subject="Unable to access API Dashboard",
                    description="Getting HTTP 403 Forbidden when trying to access the developer dashboard.",
                    category="technical",
                    status="open",
                    priority="MEDIUM",
                    intent="account_issue",
                    sentiment="neutral",
                    escalation_reason="Access control issue requiring admin clearance.",
                    created_at=datetime.utcnow() - timedelta(hours=12),
                ),
                Ticket(
                    ticket_id="TKT-1004",
                    customer_name="Sarah Wilson",
                    customer_id="CUST-1005",
                    subject="Refund Request - Damaged Package",
                    description="Package arrived with crushed outer box and broken product inside.",
                    category="returns",
                    status="resolved",
                    priority="MEDIUM",
                    intent="damaged_product",
                    sentiment="frustrated",
                    escalation_reason="Product damage photo verification needed.",
                    created_at=datetime.utcnow() - timedelta(days=1),
                ),
            ]
            db.add_all(seed_tickets)
            db.commit()

        # 3. Seed conversations
        if db.query(Conversation).count() == 0:
            logger.info("Seeding demo conversations...")
            seed_convs = [
                Conversation(
                    conversation_id="CONV-DEMO-001",
                    customer_id="CUST-1002",
                    status="escalated",
                    created_at=datetime.utcnow() - timedelta(hours=3),
                ),
                Conversation(
                    conversation_id="CONV-DEMO-002",
                    customer_id="CUST-1001",
                    status="active",
                    created_at=datetime.utcnow() - timedelta(minutes=45),
                ),
                Conversation(
                    conversation_id="CONV-DEMO-003",
                    customer_id="CUST-1003",
                    status="closed",
                    created_at=datetime.utcnow() - timedelta(days=2),
                ),
            ]
            db.add_all(seed_convs)
            db.commit()

        # 4. Seed feedback
        if db.query(Feedback).count() == 0:
            logger.info("Seeding demo feedback...")
            seed_feedback = [
                Feedback(
                    conversation_id="CONV-DEMO-003",
                    ticket_id="TKT-1004",
                    helpful=True,
                    rating=5,
                    comment="Fast response and polite assistance!",
                    created_at=datetime.utcnow() - timedelta(days=1),
                ),
                Feedback(
                    conversation_id="CONV-DEMO-001",
                    ticket_id="TKT-1001",
                    helpful=True,
                    rating=4,
                    comment="Quickly escalated to billing agent.",
                    created_at=datetime.utcnow() - timedelta(hours=2),
                ),
            ]
            db.add_all(seed_feedback)
            db.commit()

        logger.info("Database initialization and seeding completed cleanly.")
    except Exception as e:
        logger.error("Error seeding database: %s", e)
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_db()
