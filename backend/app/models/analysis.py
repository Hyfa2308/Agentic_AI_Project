"""
AI Analysis database models (Intent & Sentiment).
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from app.database.connection import Base


class IntentAnalysis(Base):
    __tablename__ = "intent_analysis"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String(50), nullable=True, index=True)
    ticket_id = Column(String(50), nullable=True, index=True)
    intent = Column(String(50), nullable=False)
    confidence = Column(Float, default=0.8)
    timestamp = Column(DateTime, default=datetime.utcnow)


class SentimentAnalysis(Base):
    __tablename__ = "sentiment_analysis"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String(50), nullable=True, index=True)
    ticket_id = Column(String(50), nullable=True, index=True)
    sentiment = Column(String(50), nullable=False)
    score = Column(Float, default=0.8)
    timestamp = Column(DateTime, default=datetime.utcnow)
