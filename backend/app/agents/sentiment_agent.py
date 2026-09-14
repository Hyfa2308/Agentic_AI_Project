"""
Sentiment Agent module.
Analyzes actual customer emotional tone and returns structured JSON output.
"""

import logging
from typing import Dict, Any
from app.agents.state import AgentState
from app.services.llm_service import llm_service

logger = logging.getLogger("assistiq")

VALID_SENTIMENTS = ["positive", "neutral", "frustrated", "angry", "disappointed", "urgent"]

ANGRY_KEYWORDS = ["unacceptable", "terrible", "worst", "furious", "lawyer", "sue", "scam", "ridiculous", "hate", "lawsuit"]
FRUSTRATED_KEYWORDS = ["frustrated", "annoyed", "delay", "waiting", "again", "stuck", "fail", "slow", "three times", "nobody helped"]
URGENT_KEYWORDS = ["urgent", "asap", "immediately", "emergency", "right now", "critical"]
DISAPPOINTED_KEYWORDS = ["disappointed", "sad", "disappointing", "expected better", "poor quality"]
POSITIVE_KEYWORDS = ["thanks", "thank you", "great", "awesome", "helpful", "good", "love", "perfect"]


def run_sentiment_agent(state: AgentState) -> Dict[str, Any]:
    """Execute Sentiment Analysis node."""
    message = state.get("message", "")
    logger.info("Executing Sentiment Agent for message: '%s'", message[:60])

    if llm_service.is_available:
        system_prompt = (
            "You are a Customer Sentiment Analysis Agent for enterprise support. "
            f"Analyze the emotional tone of the input message. Categories: {VALID_SENTIMENTS}.\n"
            "Return ONLY a JSON object with keys: 'sentiment' (str) and 'confidence' (float 0.0-1.0)."
        )
        prompt = f"Customer message: \"{message}\""
        result = llm_service.generate_json(prompt, system_prompt)

        sentiment = result.get("sentiment", "neutral")
        confidence = float(result.get("confidence", 0.90))

        if sentiment not in VALID_SENTIMENTS:
            sentiment = "neutral"

        logger.info("Sentiment Agent result (LLM): %s (conf=%.2f)", sentiment, confidence)
        return {"sentiment": sentiment, "sentiment_confidence": confidence}

    # Rule Fallback
    lower_msg = message.lower()
    sentiment = "neutral"
    confidence = 0.85

    if any(kw in lower_msg for kw in ANGRY_KEYWORDS):
        sentiment = "angry"
        confidence = 0.96
    elif any(kw in lower_msg for kw in FRUSTRATED_KEYWORDS):
        sentiment = "frustrated"
        confidence = 0.92
    elif any(kw in lower_msg for kw in URGENT_KEYWORDS):
        sentiment = "urgent"
        confidence = 0.90
    elif any(kw in lower_msg for kw in DISAPPOINTED_KEYWORDS):
        sentiment = "disappointed"
        confidence = 0.88
    elif any(kw in lower_msg for kw in POSITIVE_KEYWORDS):
        sentiment = "positive"
        confidence = 0.90

    logger.info("Sentiment Agent result (rule fallback): %s (conf=%.2f)", sentiment, confidence)
    return {"sentiment": sentiment, "sentiment_confidence": confidence}
