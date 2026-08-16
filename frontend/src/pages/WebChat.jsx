import { useState, useRef, useEffect } from "react";
import { FaRobot, FaPaperPlane, FaUser, FaThumbsUp, FaThumbsDown, FaCheck } from "react-icons/fa";
import { sendChatMessage, submitFeedback } from "../services/api";
import "../styles/WebChat.css";

function WebChat() {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! 👋 Welcome to AssistIQ. I'm your AI support assistant. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFeedback = async (msgIndex, ticketId, rating) => {
    if (!ticketId || feedbackGiven[msgIndex]) return;
    try {
      await submitFeedback({ ticket_id: ticketId, rating });
      setFeedbackGiven((prev) => ({ ...prev, [msgIndex]: rating }));
    } catch {
      console.error("Failed to submit feedback");
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Add user message
    const userMessage = { sender: "user", text: trimmed, timestamp };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await sendChatMessage(trimmed);
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
        },
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I'm sorry, I'm having trouble connecting to the server. Please try again in a moment.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-avatar">
              <FaRobot />
            </div>
            <div>
              <h2>AssistIQ AI Assistant</h2>
              <div className="chat-status">
                <div className="status-dot" />
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-body">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message-row ${msg.sender === "user" ? "user-row" : "ai-row"}`}
            >
              <div className="message-avatar">
                {msg.sender === "ai" ? <FaRobot /> : <FaUser />}
              </div>
              <div className={`message-bubble ${msg.sender === "user" ? "user-bubble" : "ai-bubble"} ${msg.isError ? "error-bubble" : ""}`}>
                <p>{msg.text}</p>
                {msg.meta && msg.meta.ticketId && (
                  <div className="message-meta">
                    <span className="meta-tag">Ticket: {msg.meta.ticketId}</span>
                    {msg.meta.priority && <span className={`meta-tag priority-${msg.meta.priority}`}>{msg.meta.priority}</span>}
                    {msg.meta.escalated && <span className="meta-tag escalated">Escalated</span>}

                    <div className="feedback-buttons">
                      {feedbackGiven[index] ? (
                        <span className="feedback-thanks"><FaCheck /> Feedback sent</span>
                      ) : (
                        <>
                          <button
                            className="feedback-btn"
                            title="Helpful"
                            onClick={() => handleFeedback(index, msg.meta.ticketId, 5)}
                          >
                            <FaThumbsUp />
                          </button>
                          <button
                            className="feedback-btn"
                            title="Not helpful"
                            onClick={() => handleFeedback(index, msg.meta.ticketId, 1)}
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

          {isLoading && (
            <div className="message-row ai-row">
              <div className="message-avatar"><FaRobot /></div>
              <div className="message-bubble ai-bubble">
                <div className="typing-indicator">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-footer">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            id="chat-input"
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()} id="chat-send-btn">
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
}

export default WebChat;
