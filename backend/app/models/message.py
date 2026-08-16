"""
Message database model for ticket conversation history.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String(50), ForeignKey("tickets.ticket_id"), nullable=False)
    sender = Column(String(20), nullable=False)  # customer, ai, agent
    message_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    ticket = relationship("Ticket", back_populates="messages")
