import { useState, useRef, useEffect } from "react";
import {
  FaRobot,
  FaPaperPlane,
  FaUser,
  FaThumbsUp,
  FaThumbsDown,
  FaCheck,
  FaRedo,
  FaPlus,
  FaComments,
  FaExclamationCircle,
} from "react-icons/fa";
import { sendChatMessage, submitFeedback } from "../services/api";
import "../styles/WebChat.css";

const SUGGESTED_PROMPTS = [
  "I can't log in to my account",
  "My payment failed and I was charged",
  "I haven't received my order yet",
  "I want to cancel my subscription",
];

function WebChat() {
  const [conversations, setConversations] = useState([
    {
      id: "CONV-1001",
      title: "New Chat",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [activeConvId, setActiveConvId] = useState("CONV-1001");

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! 👋 Welcome to AssistIQ. I'm your AI support assistant. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [lastFailedInput, setLastFailedInput] = useState("");
  const [feedbackGiven, setFeedbackGiven] = useState({});

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleFeedback = async (msgIndex, ticketId, rating) => {
    if (feedbackGiven[msgIndex]) return;
    try {
      await submitFeedback({ ticket_id: ticketId || "AI-CHAT", rating });
      setFeedbackGiven((prev) => ({ ...prev, [msgIndex]: rating }));
    } catch {
      console.error("Failed to submit feedback");
    }
  };

  const executeSendMessage = async (textToSend) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    setErrorState(null);
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Update conversation title if first user message
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId && c.title === "New Chat"
          ? { ...c, title: trimmed.length > 24 ? trimmed.substring(0, 24) + "..." : trimmed }
          : c
      )
    );

    const userMessage = { sender: "user", text: trimmed, timestamp };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await sendChatMessage(trimmed, "CUST-1001", activeConvId);
      const aiMessage = {
        sender: "ai",
        text: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        meta: {
          intent: data.intent,
          sentiment: data.sentiment,
          priority: data.priority,
          ticketId: data.ticket_id,
          escalated: data.escalated,
          escalationReason: data.escalation_reason,
        },
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setLastFailedInput(trimmed);
      setErrorState("Unable to connect to AssistIQ backend. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "AssistIQ is currently experiencing connection issues. Please try resending your message.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    executeSendMessage(input);
  };

  const handlePromptClick = (promptText) => {
    executeSendMessage(promptText);
  };

  const handleRetry = () => {
    if (lastFailedInput) {
      executeSendMessage(lastFailedInput);
    }
  };

  const handleNewConversation = () => {
    const newId = `CONV-${Date.now().toString().slice(-4)}`;
    const newConv = {
      id: newId,
      title: "New Chat",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newId);
    setMessages([
      {
        sender: "ai",
        text: "Hello! 👋 I'm your AssistIQ AI Assistant. How can I help you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setErrorState(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-layout">
        {/* Left Sidebar: Conversation History */}
        <aside className="chat-sidebar">
          <div className="sidebar-header">
            <button className="btn-new-chat" onClick={handleNewConversation}>
              <FaPlus /> New Conversation
            </button>
          </div>
          <div className="conversations-list">
            <div className="sidebar-section-title">Conversation History</div>
            {conversations.map((c) => (
              <div
                key={c.id}
                className={`conv-item ${c.id === activeConvId ? "active" : ""}`}
                onClick={() => setActiveConvId(c.id)}
              >
                <FaComments className="conv-icon" />
                <div className="conv-details">
                  <span className="conv-title">{c.title}</span>
                  <span className="conv-time">{c.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Chat Panel */}
        <main className="chat-main">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-avatar">
                <FaRobot />
              </div>
              <div>
                <h2>AssistIQ AI Assistant</h2>
                <div className="chat-status">
                  <span className="status-dot" />
                  <span>Online</span>
                </div>
              </div>
            </div>
            <button className="btn-reset-chat" onClick={handleNewConversation} title="Reset Chat">
              <FaRedo /> Reset Session
            </button>
          </div>

          {/* Messages Feed */}
          <div className="chat-body">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-row ${msg.sender === "user" ? "user-row" : "ai-row"}`}
              >
                <div className="message-avatar">
                  {msg.sender === "ai" ? <FaRobot /> : <FaUser />}
                </div>
                <div
                  className={`message-bubble ${
                    msg.sender === "user" ? "user-bubble" : "ai-bubble"
                  } ${msg.isError ? "error-bubble" : ""}`}
                >
                  <p>{msg.text}</p>

                  {/* AI Metadata Tags & Feedback */}
                  {msg.meta && (
                    <div className="message-meta">
                      {msg.meta.intent && (
                        <span className="meta-tag tag-intent">
                          Intent: {msg.meta.intent}
                        </span>
                      )}
                      {msg.meta.sentiment && (
                        <span className={`meta-tag priority-${msg.meta.sentiment}`}>
                          Sentiment: {msg.meta.sentiment}
                        </span>
                      )}
                      {msg.meta.ticketId && (
                        <span className="meta-tag tag-ticket">
                          Ticket: {msg.meta.ticketId}
                        </span>
                      )}
                      {msg.meta.escalated && (
                        <span className="meta-tag tag-escalated">
                          Escalated to Support
                        </span>
                      )}

                      <div className="feedback-buttons">
                        {feedbackGiven[index] ? (
                          <span className="feedback-thanks">
                            <FaCheck /> Feedback sent
                          </span>
                        ) : (
                          <>
                            <button
                              className="feedback-btn"
                              title="Helpful"
                              onClick={() =>
                                handleFeedback(index, msg.meta.ticketId, 5)
                              }
                            >
                              <FaThumbsUp />
                            </button>
                            <button
                              className="feedback-btn"
                              title="Not helpful"
                              onClick={() =>
                                handleFeedback(index, msg.meta.ticketId, 1)
                              }
                            >
                              <FaThumbsDown />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <span className="message-time">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {/* Suggested Prompts Chips */}
            {messages.length === 1 && (
              <div className="suggested-prompts-wrapper">
                <p className="suggested-title">Suggested Prompts:</p>
                <div className="suggested-chips">
                  {SUGGESTED_PROMPTS.map((promptText, i) => (
                    <button
                      key={i}
                      className="prompt-chip"
                      onClick={() => handlePromptClick(promptText)}
                    >
                      "{promptText}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing Loading Indicator */}
            {isLoading && (
              <div className="message-row ai-row">
                <div className="message-avatar">
                  <FaRobot />
                </div>
                <div className="message-bubble ai-bubble loading-bubble">
                  <div className="typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="typing-text">AssistIQ Agent is analyzing your query...</span>
                </div>
              </div>
            )}

            {/* Error & Retry Banner */}
            {errorState && (
              <div className="error-banner-inline">
                <FaExclamationCircle />
                <span>{errorState}</span>
                <button className="btn-retry" onClick={handleRetry}>
                  <FaRedo /> Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div className="chat-footer">
            <textarea
              className="chat-textarea"
              placeholder="Describe your issue... (Enter to send, Shift+Enter for new line)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows="1"
              id="chat-input-box"
            />
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              id="chat-send-button"
            >
              <FaPaperPlane />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default WebChat;
