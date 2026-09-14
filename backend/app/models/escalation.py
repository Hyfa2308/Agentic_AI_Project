"""
Escalation database model.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from app.database.connection import Base


class Escalation(Base):
    __tablename__ = "escalations"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String(50), ForeignKey("tickets.ticket_id"), nullable=False, unique=True)
    reason = Column(Text, nullable=False)
    priority = Column(String(20), default="HIGH")
    summary = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    status = Column(String(20), default="pending")  # pending, reviewed, resolved
    created_at = Column(DateTime, default=datetime.utcnow)
