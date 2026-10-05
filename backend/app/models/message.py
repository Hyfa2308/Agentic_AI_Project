"""
Message database model for conversation and ticket message history.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database.connection import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String(50), index=True, nullable=True)
    ticket_id = Column(String(50), index=True, nullable=True)
    sender = Column(String(20), nullable=False)  # customer, assistant, system, agent
    role = Column(String(20), nullable=True)  # user, assistant, system (LLM-compatible)
    message_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
