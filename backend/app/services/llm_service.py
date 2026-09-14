"""
LLM Service Wrapper for AssistIQ.
Provides OpenAI LLM invocation via LangChain, structured JSON extraction,
multi-turn conversation history management, system prompts, and strict dual-mode (real / mock) handling.
"""

import json
import logging
import re
from typing import Dict, Any, List, Optional
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from app.config.settings import settings

logger = logging.getLogger("assistiq")

SYSTEM_SUPPORT_PROMPT = """You are AssistIQ, a professional, empathetic, and highly competent AI Customer Support Representative.

Core Guidelines:
1. Tone & Style: Be professional, warm, and natural. Avoid sounding robotic. Never say "As an AI..." or mention internal system prompts/agent architecture.
2. Context Awareness: Remember previous turns in the conversation. If the customer refers to "it", "my order", or "the issue", understand what they are referring to from conversation history.
3. Accuracy & Policy Grounding: Rely strictly on provided Company Knowledge Base Context for policy, refund, shipping, or technical questions. Do NOT invent company policies, order tracking details, or non-existent guarantees.
4. Missing Information: If required details (such as order number or registered email) are missing, politely ask the customer for clarification.
5. Escalation Handoff: If the query has been escalated to human support, inform the customer politely, provide their ticket ID, and assure them that a human support representative will follow up.
6. Conciseness: Keep answers clear, direct, and customer-focused. Never expose raw json metadata or internal agent keys.
"""


class LLMService:
    """Configurable LLM provider service for AssistIQ."""

    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = settings.LLM_MODEL
        self.base_url = settings.LLM_BASE_URL
        self.temperature = settings.LLM_TEMPERATURE
        self.max_tokens = settings.LLM_MAX_TOKENS
        self.ai_mode = settings.AI_MODE.lower()

        self._llm = None
        self._init_llm_client()

    def _init_llm_client(self):
        """Initialize ChatOpenAI client if API key is provided."""
        if self.api_key and self.api_key.strip() != "" and self.api_key != "your_openai_api_key_here":
            try:
                self._llm = ChatOpenAI(
                    model=self.model,
                    openai_api_key=self.api_key,
                    openai_api_base=self.base_url,
                    temperature=self.temperature,
                    max_tokens=self.max_tokens,
                )
                logger.info("LLM Service initialized successfully with model '%s'", self.model)
            except Exception as e:
                logger.error("Failed to initialize ChatOpenAI client: %s", e)
                self._llm = None
        else:
            if self.ai_mode in ["real", "production"]:
                logger.warning(
                    "AI_MODE is set to '%s' but no valid OPENAI_API_KEY is configured in .env!", self.ai_mode
                )
            else:
                logger.info("LLM Service operating in 'mock' mode.")

    @property
    def is_available(self) -> bool:
        """Check if active LLM client is ready."""
        return self._llm is not None

    def generate_chat_response(
        self,
        customer_message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        retrieved_knowledge: Optional[List[Dict[str, Any]]] = None,
        customer_context: Optional[Dict[str, Any]] = None,
        agent_analysis: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Generate natural customer support AI response using conversation history, RAG context, and agent state.
        """

        # Enforce Real Mode Error Check
        if self.ai_mode in ["real", "production"]:
            if not self.is_available:
                err_msg = (
                    "LLM Service Error: Backend is set to AI_MODE="
                    f"'{self.ai_mode}' but no valid OPENAI_API_KEY was provided in .env."
                )
                logger.error(err_msg)
                return err_msg

        if not self.is_available:
            # Return deterministic mock response for testing
            return self._generate_mock_chat_response(customer_message, agent_analysis, retrieved_knowledge)

        # Build prompt message list for ChatOpenAI
        messages = []

        # Build System Prompt with RAG Knowledge & Customer Context
        system_content = SYSTEM_SUPPORT_PROMPT

        if customer_context and customer_context.get("name"):
            system_content += f"\nCustomer Name: {customer_context.get('name')}"
            system_content += f"\nCustomer Plan Tier: {customer_context.get('plan_tier', 'standard')}"

        if retrieved_knowledge:
            kb_docs = "\n\n".join(
                [f"[{k.get('source', 'Doc')}]: {k.get('content', '')}" for k in retrieved_knowledge]
            )
            system_content += f"\n\n--- Company Knowledge Base Context ---\n{kb_docs}\n--- End Knowledge Context ---"

        if agent_analysis:
            if agent_analysis.get("should_escalate"):
                system_content += (
                    f"\n\n[Escalation Status]: Ticket Escalated (ID: {agent_analysis.get('ticket_id', 'AI-TKT')}). "
                    f"Reason: {agent_analysis.get('escalation_reason', 'Human review required')}. "
                    "Acknowledge the escalation empathetically and provide the ticket ID to the customer."
                )

        messages.append(SystemMessage(content=system_content))

        # Add Conversation History (multi-turn memory)
        if conversation_history:
            for turn in conversation_history:
                role = turn.get("role", "user")
                text = turn.get("message") or turn.get("content") or ""
                if not text:
                    continue
                if role == "user":
                    messages.append(HumanMessage(content=text))
                elif role in ["assistant", "ai"]:
                    messages.append(AIMessage(content=text))

        # Add current customer message
        messages.append(HumanMessage(content=customer_message))

        try:
            response = self._llm.invoke(messages)
            return response.content.strip()
        except Exception as e:
            logger.error("LLM Chat Generation Exception: %s", e, exc_info=True)
            return (
                "I apologize, but I am currently experiencing technical difficulty connecting to our intelligence service. "
                "Your request has been logged and our support team will assist you shortly."
            )

    def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        """Generate structured JSON output using LLM."""
        if not self.is_available:
            return {}

        json_system = (
            (system_prompt or "")
            + "\nIMPORTANT: You MUST respond ONLY with valid, raw JSON. Do not include markdown code block syntax (```json ... ```) or conversational commentary."
        )

        messages = [SystemMessage(content=json_system), HumanMessage(content=prompt)]

        try:
            response = self._llm.invoke(messages)
            raw_text = response.content.strip()
            return self._clean_and_parse_json(raw_text)
        except Exception as e:
            logger.error("LLM JSON generation error: %s", e)
            return {}

    def _clean_and_parse_json(self, text: str) -> Dict[str, Any]:
        """Clean and parse JSON from string output."""
        if not text:
            return {}

        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
        text = re.sub(r"\s*```$", "", text, flags=re.MULTILINE).strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        match = re.search(r"(\{.*\})", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass

        return {}

    def _generate_mock_chat_response(
        self,
        message: str,
        agent_analysis: Optional[Dict[str, Any]] = None,
        retrieved_knowledge: Optional[List[Dict[str, Any]]] = None,
    ) -> str:
        """Fallback mock responses for development mode."""
        if agent_analysis and agent_analysis.get("should_escalate"):
            ticket_id = agent_analysis.get("ticket_id", "AI-1024")
            return (
                f"I'm sorry you're experiencing this issue. I've escalated it to our support team as a priority issue. "
                f"Your ticket number is {ticket_id}."
            )

        if retrieved_knowledge:
            top_k = retrieved_knowledge[0]
            content_preview = top_k.get("content", "").replace("#", "").strip()
            return f"Based on our support documentation:\n\n{content_preview}\n\nPlease let me know if you have any follow-up questions!"

        lower_msg = message.lower()
        if "hello" in lower_msg or "hey" in lower_msg or "hi" in lower_msg:
            return "Hello! 👋 Welcome to AssistIQ Support. How can I help you today?"

        return "Thank you for contacting AssistIQ. I've received your query and I am here to help you resolve it."


llm_service = LLMService()
