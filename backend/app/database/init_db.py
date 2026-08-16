"""
Database initialization script.
Creates tables and populates seed data (e.g. sample customers & tickets).
"""

import logging
from app.database.connection import engine, Base, SessionLocal
from app.models.customer import Customer
from app.models.ticket import Ticket
from app.models.message import Message

logger = logging.getLogger("assistiq")


def init_db():
    """Create tables and seed initial data."""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Seed default customers if none exist
        if db.query(Customer).count() == 0:
            logger.info("Seeding initial customers...")
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
            ]
            db.add_all(seed_customers)
            db.commit()
            logger.info("Seed customers created successfully.")
    except Exception as e:
        logger.error("Error seeding database: %s", e)
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_db()
