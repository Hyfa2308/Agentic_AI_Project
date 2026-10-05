import { useState } from "react";
import { FiMessageSquare, FiSend, FiUser, FiChevronRight, FiChevronLeft, FiPaperclip, FiZap } from "react-icons/fi";
import { sendChatMessage } from "../services/api";

const DEMO_INBOX = [
  { id: "CONV-DEMO-001", name: "Jane Smith", subject: "Duplicate Payment Charge - Order #ORD5921", time: "10m ago", sentiment: "angry", status: "escalated", customerId: "CUST-1002", tier: "ENTERPRISE" },
  { id: "CONV-DEMO-002", name: "Michael Brown", subject: "Delayed Delivery past guaranteed date", time: "25m ago", sentiment: "frustrated", status: "in_progress", customerId: "CUST-1004", tier: "ENTERPRISE" },
  { id: "CONV-DEMO-003", name: "John Doe", subject: "Unable to access API Developer Portal", time: "1h ago", sentiment: "neutral", status: "open", customerId: "CUST-1001", tier: "STANDARD" },
];

const Conversations = () => {
  const [selectedConv, setSelectedConv] = useState(DEMO_INBOX[0]);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello Jane! Welcome to AssistIQ support. How can I help you today?", time: "10:15 AM" },
    { role: "user", text: "I was charged twice on my card for order ORD5921!", time: "10:16 AM" },
    { role: "assistant", text: "I apologize for the duplicate charge on order ORD5921. I have escalated this issue to our Tier-2 support team. Your ticket ID is TKT-1001.", time: "10:16 AM", sentiment: "angry", escalated: true, ticketId: "TKT-1001" },
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMsg.trim() || loading) return;

    const userText = inputMsg;
    setInputMsg("");
    setMessages((prev) => [...prev, { role: "user", text: userText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setLoading(true);

    try {
      const res = await sendChatMessage(userText, selectedConv.customerId, selectedConv.id);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: res.response,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sentiment: res.sentiment,
          escalated: res.escalated,
          ticketId: res.ticket_id,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Unable to connect to AI server. Please try again.", time: "Now" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inbox-layout-container animate-fade-in">
      {/* ── LEFT: CONVERSATION LIST ─────────────────────────────────── */}
      <aside className="inbox-sidebar">
        <div className="inbox-sidebar-header">
          <h3>Inbox</h3>
          <span className="badge badge-status-open">{DEMO_INBOX.length} Active</span>
        </div>

        <div className="inbox-list">
          {DEMO_INBOX.map((conv) => (
            <div
              key={conv.id}
              className={`inbox-row ${selectedConv.id === conv.id ? "selected" : ""}`}
              onClick={() => setSelectedConv(conv)}
            >
              <div className="inbox-row-avatar">{conv.name.charAt(0)}</div>
              <div className="inbox-row-content">
                <div className="row-top">
                  <span className="row-name">{conv.name}</span>
                  <span className="row-time">{conv.time}</span>
                </div>
                <p className="row-subject">{conv.subject}</p>
                <div className="row-badges">
                  <span className={`badge badge-sentiment-${conv.sentiment}`}>{conv.sentiment}</span>
                  <span className={`badge badge-status-${conv.status}`}>{conv.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ── MAIN: SELECTED CONVERSATION ─────────────────────────────── */}
      <main className="inbox-main">
        <div className="inbox-main-header">
          <div>
            <h2>{selectedConv.name}</h2>
            <span className="code-text">{selectedConv.id} • {selectedConv.customerId}</span>
          </div>

          <button
            onClick={() => setShowRightPanel(!showRightPanel)}
            className="btn-outline-sm"
          >
            {showRightPanel ? <FiChevronRight /> : <FiChevronLeft />} Customer Context
          </button>
        </div>

        {/* Message Timeline */}
        <div className="inbox-messages-thread">
          {messages.map((m, i) => (
            <div key={i} className={`inbox-msg-row ${m.role}`}>
              <div className="msg-avatar">{m.role === "assistant" ? <FiZap /> : <FiUser />}</div>
              <div className="msg-bubble-group">
                <div className="msg-author">{m.role === "assistant" ? "AssistIQ AI Assistant" : selectedConv.name} • {m.time}</div>
                <div className={`msg-bubble ${m.role}`}>
                  <p>{m.text}</p>
                  {m.escalated && m.ticketId && (
                    <div className="inline-ticket-notice">
                      Escalated Case. Ticket ID: <strong>{m.ticketId}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && <div className="text-muted">AssistIQ is processing response...</div>}
        </div>

        {/* Composer */}
        <form onSubmit={handleSendMessage} className="inbox-composer">
          <input
            type="text"
            placeholder="Type your message to customer..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
          />
          <button type="submit" disabled={!inputMsg.trim() || loading} className="btn-primary-sm">
            <FiSend /> Send
          </button>
        </form>
      </main>

      {/* ── RIGHT OPTIONAL: COMPACT CUSTOMER CONTEXT ────────────────── */}
      {showRightPanel && (
        <aside className="inbox-context-panel">
          <h3>Customer Context</h3>

          <div className="context-group">
            <label>Customer ID</label>
            <div className="val code-text">{selectedConv.customerId}</div>
          </div>

          <div className="context-group">
            <label>Account Tier</label>
            <div className="val"><span className="badge badge-priority-medium">{selectedConv.tier}</span></div>
          </div>

          <div className="context-group">
            <label>Current Sentiment</label>
            <div className="val"><span className={`badge badge-sentiment-${selectedConv.sentiment}`}>{selectedConv.sentiment}</span></div>
          </div>

          <div className="context-group">
            <label>Previous Tickets</label>
            <ul className="prev-tickets-list">
              <li><span className="code-text">TKT-1001</span> (Open - Billing)</li>
              <li><span className="code-text">TKT-0942</span> (Resolved - Shipping)</li>
            </ul>
          </div>
        </aside>
      )}
    </div>
  );
};

export default Conversations;
