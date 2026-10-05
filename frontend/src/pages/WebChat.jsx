import { useState, useRef, useEffect } from "react";
import { FiSend, FiPaperclip, FiZap, FiUser, FiRefreshCw, FiAlertTriangle } from "react-icons/fi";
import { sendChatMessage } from "../services/api";

const SUGGESTED_PROMPTS = [
  "Hi, I need help with my order.",
  "My order hasn't arrived yet.",
  "I was charged twice for order ORD5921.",
  "What is your refund policy?",
];

const WebChat = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! Welcome to AssistIQ Customer Support. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputMsg;
    if (!textToSend.trim() || loading) return;

    if (!customText) setInputMsg("");
    setMessages((prev) => [
      ...prev,
      { role: "user", text: textToSend, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setLoading(true);

    try {
      const res = await sendChatMessage(textToSend, "CUST-1002", conversationId);
      if (res.conversation_id && !conversationId) setConversationId(res.conversation_id);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: res.response,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          escalated: res.escalated,
          ticketId: res.ticket_id,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Unable to connect to AssistIQ services. Please try again.", time: "Now" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setConversationId(null);
    setMessages([
      {
        role: "assistant",
        text: "Hello! Welcome to AssistIQ Customer Support. How can I help you today?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="customer-chat-wrapper animate-fade-in">
      <div className="chat-container">
        {/* Header */}
        <header className="chat-header">
          <div className="brand-info">
            <div className="icon-badge"><FiZap /></div>
            <div>
              <h2>AssistIQ</h2>
              <span className="sub">AI Customer Support</span>
            </div>
          </div>
          <button onClick={handleReset} className="btn-icon" title="Reset Conversation">
            <FiRefreshCw />
          </button>
        </header>

        {/* Conversation Thread */}
        <div className="chat-thread">
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble-row ${m.role}`}>
              <div className="chat-avatar">{m.role === "assistant" ? <FiZap /> : <FiUser />}</div>
              <div className="bubble-wrapper">
                <div className={`chat-bubble ${m.role}`}>
                  <p>{m.text}</p>
                  {m.escalated && m.ticketId && (
                    <div className="chat-escalation-alert">
                      <FiAlertTriangle />
                      <span>Issue escalated to human support. Ticket ID: <strong>{m.ticketId}</strong></span>
                    </div>
                  )}
                </div>
                <span className="chat-time">{m.time}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-bubble-row assistant">
              <div className="chat-avatar"><FiZap /></div>
              <div className="chat-bubble assistant">
                <p className="typing-text">AssistIQ is thinking...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Chips */}
        {messages.length <= 2 && (
          <div className="chat-chips-row">
            {SUGGESTED_PROMPTS.map((promptText, i) => (
              <button key={i} onClick={() => handleSendMessage(promptText)} className="chat-chip">
                {promptText}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="chat-composer">
          <button type="button" className="btn-clip" title="Attach file"><FiPaperclip /></button>
          <input
            type="text"
            placeholder="Type your message..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
          />
          <button type="submit" disabled={!inputMsg.trim() || loading} className="btn-send">
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  );
};

export default WebChat;
