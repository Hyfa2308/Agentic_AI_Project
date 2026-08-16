"""
Sentiment Agent module.
Detects customer emotion and sentiment confidence.
"""

import logging
from typing import Dict, Any
from app.agents.state import AgentState
from app.services.llm_service import llm_service

logger = logging.getLogger("assistiq")

VALID_SENTIMENTS = ["positive", "neutral", "negative", "frustrated", "angry"]

ANGRY_KEYWORDS = ["unacceptable", "terrible", "worst", "furious", "lawyer", "sue", "scam", "ridiculous", "hate"]
FRUSTRATED_KEYWORDS = ["frustrated", "annoyed", "delay", "waiting", "again", "stuck", "fail", "slow"]
POSITIVE_KEYWORDS = ["thanks", "thank you", "great", "awesome", "helpful", "good", "love"]


def run_sentiment_agent(state: AgentState) -> Dict[str, Any]:
    """Execute Sentiment Analysis node."""
    message = state.get("message", "")
    logger.info("Executing Sentiment Agent for message: '%s'", message[:60])

    if llm_service.is_available:
        system_prompt = (
            "You are a Customer Sentiment Analysis Agent. "
            f"Analyze the emotional tone of the input. Categories: {VALID_SENTIMENTS}. "
            "Return JSON object with keys: 'sentiment' (str) and 'confidence' (float 0.0-1.0)."
        )
        prompt = f"Customer message: \"{message}\""
        result = llm_service.generate_json(prompt, system_prompt)

        sentiment = result.get("sentiment", "neutral")
        confidence = float(result.get("confidence", 0.85))

        if sentiment not in VALID_SENTIMENTS:
            sentiment = "neutral"

        return {"sentiment": sentiment, "sentiment_confidence": confidence}

    # Keyword fallback
    lower_msg = message.lower()
    sentiment = "neutral"
    confidence = 0.80

    if any(kw in lower_msg for kw in ANGRY_KEYWORDS):
        sentiment = "angry"
        confidence = 0.95
    elif any(kw in lower_msg for kw in FRUSTRATED_KEYWORDS):
        sentiment = "frustrated"
        confidence = 0.88
    elif any(kw in lower_msg for kw in POSITIVE_KEYWORDS):
        sentiment = "positive"
        confidence = 0.90
    elif "not" in lower_msg or "problem" in lower_msg or "issue" in lower_msg:
        sentiment = "negative"
        confidence = 0.75

    logger.info("Sentiment Agent result (rule fallback): %s (conf=%.2f)", sentiment, confidence)
    return {"sentiment": sentiment, "sentiment_confidence": confidence}
