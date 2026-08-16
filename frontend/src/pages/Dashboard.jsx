import { useState, useEffect } from "react";
import {
  FaUserShield,
  FaFilter,
  FaSearch,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaCommentAlt,
  FaRobot,
  FaPaperPlane,
} from "react-icons/fa";
import { getTickets, updateTicket, addTicketMessage } from "../services/api";
import "../styles/Dashboard.css";

function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [escalatedOnly, setEscalatedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [humanNotesText, setHumanNotesText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (escalatedOnly) params.escalated = true;

      const data = await getTickets(params);
      setTickets(data.tickets || []);
    } catch {
      console.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, escalatedOnly]);

  const handleSelectTicket = (t) => {
    setSelectedTicket(t);
    setHumanNotesText(t.human_notes || "");
    setReplyText("");
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedTicket) return;
    try {
      const updated = await updateTicket(selectedTicket.ticket_id, {
        status: newStatus,
        human_notes: humanNotesText,
      });
      setSelectedTicket(updated);
      fetchTickets();
    } catch {
      alert("Failed to update ticket status.");
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setSubmittingReply(true);

    try {
      await addTicketMessage(selectedTicket.ticket_id, {
        sender: "agent",
        message_text: replyText,
      });
      const updated = await updateTicket(selectedTicket.ticket_id, {
        status: "in_progress",
        human_notes: humanNotesText,
      });
      setSelectedTicket(updated);
      setReplyText("");
      fetchTickets();
    } catch {
      alert("Failed to send reply.");
    } finally {
      setSubmittingReply(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.ticket_id.toLowerCase().includes(q) ||
      t.customer_name.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      (t.intent && t.intent.toLowerCase().includes(q))
    );
  });

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="header-left">
          <div className="header-icon-wrapper">
            <FaUserShield />
          </div>
          <div>
            <h1>Human Support Dashboard</h1>
            <p>Monitor escalated tickets, review AI context summaries, and resolve issues</p>
          </div>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="dashboard-toolbar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search ticket ID, customer, intent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <FaFilter className="filter-icon" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={escalatedOnly}
              onChange={(e) => setEscalatedOnly(e.target.checked)}
            />
            Escalated Only
          </label>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="dashboard-grid">
        {/* Ticket List Panel */}
        <div className="ticket-list-panel">
          <div className="panel-header">
            <h3>Tickets ({filteredTickets.length})</h3>
          </div>
          <div className="ticket-cards-list">
            {loading ? (
              <div className="loading-state">Loading tickets...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="empty-state">No tickets found matching filters.</div>
            ) : (
              filteredTickets.map((t) => (
                <div
                  key={t.ticket_id}
                  className={`ticket-card ${selectedTicket?.ticket_id === t.ticket_id ? "selected" : ""}`}
                  onClick={() => handleSelectTicket(t)}
                >
                  <div className="card-top">
                    <span className="ticket-id">{t.ticket_id}</span>
                    <span className={`status-badge status-${t.status}`}>{t.status.replace("_", " ")}</span>
                  </div>
                  <h4 className="card-subject">{t.subject}</h4>
                  <div className="card-meta">
                    <span className="customer-name">{t.customer_name}</span>
                    {t.priority && (
                      <span className={`priority-badge priority-${t.priority}`}>{t.priority}</span>
                    )}
                    {t.escalated && (
                      <span className="escalated-tag">
                        <FaExclamationTriangle /> Escalated
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ticket Detail Panel */}
        <div className="ticket-detail-panel">
          {selectedTicket ? (
            <div className="detail-container">
              {/* Detail Header */}
              <div className="detail-header">
                <div>
                  <div className="detail-tags">
                    <span className="ticket-id-large">{selectedTicket.ticket_id}</span>
                    <span className={`status-badge status-${selectedTicket.status}`}>
                      {selectedTicket.status.replace("_", " ")}
                    </span>
                    <span className={`priority-badge priority-${selectedTicket.priority}`}>
                      {selectedTicket.priority} Priority
                    </span>
                    {selectedTicket.escalated && (
                      <span className="escalated-tag">
                        <FaExclamationTriangle /> Escalated to Human
                      </span>
                    )}
                  </div>
                  <h2>{selectedTicket.subject}</h2>
                  <p className="detail-meta">
                    Customer: <strong>{selectedTicket.customer_name}</strong> | Created:{" "}
                    {new Date(selectedTicket.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="action-buttons">
                  {selectedTicket.status !== "resolved" ? (
                    <button className="btn btn-success" onClick={() => handleStatusChange("resolved")}>
                      <FaCheckCircle /> Mark Resolved
                    </button>
                  ) : (
                    <button className="btn btn-secondary" onClick={() => handleStatusChange("open")}>
                      Re-open Ticket
                    </button>
                  )}
                </div>
              </div>

              {/* AI Analysis Box */}
              <div className="ai-analysis-box">
                <div className="analysis-box-header">
                  <FaRobot className="ai-icon" />
                  <h3>AI Agent Analysis & Context Summary</h3>
                </div>

                <div className="analysis-grid">
                  <div className="analysis-item">
                    <span className="label">Detected Intent:</span>
                    <span className="val-highlight">{selectedTicket.intent || "N/A"}</span>
                  </div>
                  <div className="analysis-item">
                    <span className="label">Customer Sentiment:</span>
                    <span className={`val-highlight sentiment-${selectedTicket.sentiment}`}>
                      {selectedTicket.sentiment || "N/A"}
                    </span>
                  </div>
                  <div className="analysis-item full-width">
                    <span className="label">Escalation Reason:</span>
                    <p className="val-text">{selectedTicket.escalation_reason || "None"}</p>
                  </div>
                  <div className="analysis-item full-width">
                    <span className="label">AI Issue Summary:</span>
                    <p className="val-text">{selectedTicket.ai_summary || "No summary available."}</p>
                  </div>
                  <div className="analysis-item full-width">
                    <span className="label">Recommended Action:</span>
                    <p className="val-text action-box">{selectedTicket.recommended_action || "Follow standard SOP."}</p>
                  </div>
                </div>
              </div>

              {/* Conversation Messages */}
              <div className="thread-section">
                <h3>Message Thread</h3>
                <div className="thread-messages">
                  {(selectedTicket.messages || []).map((m, idx) => (
                    <div key={idx} className={`thread-msg msg-${m.sender}`}>
                      <div className="msg-header">
                        <strong>{m.sender.toUpperCase()}</strong>
                      </div>
                      <p>{m.message_text}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <div className="reply-form">
                  <h4>Human Support Reply</h4>
                  <textarea
                    rows="3"
                    placeholder="Type your response to the customer..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="reply-actions">
                    <input
                      type="text"
                      className="notes-input"
                      placeholder="Internal agent notes (optional)..."
                      value={humanNotesText}
                      onChange={(e) => setHumanNotesText(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={handleSendReply} disabled={submittingReply || !replyText.trim()}>
                      <FaPaperPlane /> Send Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-selection-state">
              <FaCommentAlt className="large-icon" />
              <h3>Select a Ticket</h3>
              <p>Click on any ticket from the left panel to inspect AI analysis and respond.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
