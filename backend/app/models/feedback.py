"""
Feedback database model for customer response rating and escalation tracking.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String(50), ForeignKey("tickets.ticket_id"), nullable=False, unique=True)
    rating = Column(Integer, nullable=True)  # 1-5 or 1 (positive) / -1 (negative)
    comments = Column(Text, nullable=True)
    escalated = Column(Boolean, default=False)
    resolved_by = Column(String(20), default="ai")  # ai, human
    created_at = Column(DateTime, default=datetime.utcnow)

    ticket = relationship("Ticket", back_populates="feedback")
