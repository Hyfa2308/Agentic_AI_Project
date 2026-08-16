"""
Ticket database model.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(String(50), ForeignKey("customers.customer_id"), nullable=True)
    customer_name = Column(String(100), nullable=False)
    subject = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=True)
    priority = Column(String(20), default="LOW")  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(20), default="open")   # open, in_progress, resolved, closed
    intent = Column(String(50), nullable=True)
    sentiment = Column(String(50), nullable=True)
    escalated = Column(Boolean, default=False)
    escalation_reason = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    human_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("Customer", back_populates="tickets")
    messages = relationship("Message", back_populates="ticket", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="ticket", uselist=False, cascade="all, delete-orphan")
