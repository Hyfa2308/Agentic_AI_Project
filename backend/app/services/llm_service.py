"""
LLM Service wrapper.
Provides OpenAI-compatible LLM invocation with structured JSON extraction,
retries, and safe fallback handling when LLM keys are absent or requests fail.
"""

import json
import logging
import re
from typing import Dict, Any, Optional
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

from app.config.settings import settings

logger = logging.getLogger("assistiq")


class LLMService:
    """Configurable LLM provider service."""

    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = settings.LLM_MODEL
        self.base_url = settings.LLM_BASE_URL
        self.temperature = settings.LLM_TEMPERATURE
        self.max_tokens = settings.LLM_MAX_TOKENS

        self._llm = None
        if self.api_key and self.api_key != "your_openai_api_key_here":
            try:
                self._llm = ChatOpenAI(
                    model=self.model,
                    openai_api_key=self.api_key,
                    openai_api_base=self.base_url,
                    temperature=self.temperature,
                    max_tokens=self.max_tokens,
                )
                logger.info("LLM Service initialized with model %s", self.model)
            except Exception as e:
                logger.warning("Failed to initialize ChatOpenAI: %s. Using rule fallback.", e)
        else:
            logger.info("No valid OPENAI_API_KEY found. LLM Service operating in rule-based fallback mode.")

    @property
    def is_available(self) -> bool:
        """Check if active LLM client is configured."""
        return self._llm is not None

    def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Generate text from prompt. Returns fallback text if LLM is unavailable or errors out."""
        if not self.is_available:
            return "Rule Fallback: Service operating without external LLM key."

        messages = []
        if system_prompt:
            messages.append(SystemMessage(content=system_prompt))
        messages.append(HumanMessage(content=prompt))

        try:
            response = self._llm.invoke(messages)
            return response.content.strip()
        except Exception as e:
            logger.error("LLM text generation error: %s", e)
            return f"Error during generation: {e}"

    def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        """Generate and parse structured JSON output. Handles markdown codeblocks and malformed JSON."""
        if not self.is_available:
            logger.debug("LLM unavailable, returning empty dict for JSON request.")
            return {}

        json_system = (system_prompt or "") + "\nIMPORTANT: You MUST respond ONLY with valid, raw JSON. Do not include markdown formatting or extra commentary."

        raw_output = self.generate_text(prompt, json_system)
        return self._clean_and_parse_json(raw_output)

    def _clean_and_parse_json(self, text: str) -> Dict[str, Any]:
        """Extract and parse JSON object from text."""
        if not text:
            return {}

        # Remove markdown ```json ... ``` tags
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
        text = re.sub(r"\s*```$", "", text, flags=re.MULTILINE).strip()

        # Try direct parse
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # Match inner JSON object {...}
        match = re.search(r"(\{.*\})", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass

        logger.warning("Failed to parse JSON from LLM output: %s", text[:200])
        return {}


# Global instance singleton
llm_service = LLMService()
