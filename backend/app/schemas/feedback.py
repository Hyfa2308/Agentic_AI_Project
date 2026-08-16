"""
Pydantic schemas for feedback submission.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class FeedbackCreateRequest(BaseModel):
    ticket_id: str
    rating: Optional[int] = None  # 1-5 or 1/-1
    comments: Optional[str] = None
    resolved_by: Optional[str] = "ai"


class FeedbackResponse(BaseModel):
    id: int
    ticket_id: str
    rating: Optional[int] = None
    comments: Optional[str] = None
    escalated: bool = False
    resolved_by: Optional[str] = "ai"
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
