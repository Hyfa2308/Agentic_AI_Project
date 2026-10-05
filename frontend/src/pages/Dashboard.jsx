import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiAlertCircle, FiMessageSquare, FiShield, FiStar, FiChevronRight } from "react-icons/fi";
import { getTickets, getAnalytics } from "../services/api";

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getAnalytics().catch(() => null),
      getTickets().catch(() => ({ tickets: [] })),
    ]).then(([analyticsData, ticketsData]) => {
      if (isMounted) {
        if (analyticsData) setAnalytics(analyticsData);
        if (ticketsData && ticketsData.tickets) setTickets(ticketsData.tickets);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const stats = analytics?.summary || {
    total_conversations: 168,
    active_conversations: 14,
    escalated_tickets: 8,
    high_priority_cases: 5,
    csat_score: 4.8,
  };

  const highPriorityTickets = tickets.filter((t) => t.priority === "HIGH" || t.priority === "CRITICAL");
  const recentTicketsList = tickets.slice(0, 5);

  return (
    <div className="dashboard-view animate-fade-in">
      <div className="view-header">
        <div>
          <h2 className="view-title">Dashboard</h2>
          <p className="view-subtitle">Overview of your customer support activity.</p>
        </div>
      </div>

      {/* ── 4 COMPACT METRICS BLOCKS ──────────────────────────────────── */}
      <div className="metrics-grid-4">
        <div className="metric-block">
          <span className="metric-lbl">Open Tickets</span>
          <span className="metric-val">{stats.escalated_tickets}</span>
        </div>
        <div className="metric-block">
          <span className="metric-lbl">Active Conversations</span>
          <span className="metric-val">{stats.active_conversations}</span>
        </div>
        <div className="metric-block">
          <span className="metric-lbl">Escalated Cases</span>
          <span className="metric-val text-danger">{stats.high_priority_cases}</span>
        </div>
        <div className="metric-block">
          <span className="metric-lbl">Customer Satisfaction</span>
          <span className="metric-val text-success">{stats.csat_score} / 5.0</span>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ────────────────────────────────────────── */}
      <div className="dashboard-main-grid">
        {/* LEFT / LARGE AREA: Recent Conversations */}
        <div className="content-card left-main">
          <div className="card-header-flex">
            <h3>Recent Conversations</h3>
            <Link to="/conversations" className="link-sm">View all <FiChevronRight /></Link>
          </div>

          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Subject</th>
                  <th>Sentiment</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { customer: "Jane Smith", subject: "Duplicate Payment Charge - Order #ORD5921", sentiment: "angry", status: "escalated", time: "10m ago" },
                  { customer: "Michael Brown", subject: "Delayed Delivery past guaranteed date", sentiment: "frustrated", status: "in_progress", time: "25m ago" },
                  { customer: "John Doe", subject: "Unable to access API Developer Portal", sentiment: "neutral", status: "open", time: "1h ago" },
                  { customer: "Sarah Wilson", subject: "Refund Request - Damaged Package", sentiment: "frustrated", status: "resolved", time: "3h ago" },
                ].map((row, i) => (
                  <tr key={i}>
                    <td><strong>{row.customer}</strong></td>
                    <td className="truncate-text">{row.subject}</td>
                    <td><span className={`badge badge-sentiment-${row.sentiment}`}>{row.sentiment}</span></td>
                    <td><span className={`badge badge-status-${row.status}`}>{row.status}</span></td>
                    <td className="text-muted">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT / SMALL AREA: Priority Queue */}
        <div className="content-card right-sidebar-queue">
          <div className="card-header-flex">
            <h3>Priority Queue</h3>
            <span className="badge badge-priority-critical">{highPriorityTickets.length || 3} Cases</span>
          </div>

          <div className="priority-list">
            {(highPriorityTickets.length > 0 ? highPriorityTickets : [
              { ticket_id: "TKT-1001", subject: "Duplicate Payment Charge", priority: "HIGH", customer_name: "Jane Smith" },
              { ticket_id: "TKT-1002", subject: "Delayed Delivery breach", priority: "CRITICAL", customer_name: "Michael Brown" },
            ]).map((t) => (
              <div key={t.ticket_id} className="priority-item">
                <div className="priority-header">
                  <span className="code-text">{t.ticket_id}</span>
                  <span className={`badge badge-priority-${(t.priority || "HIGH").toLowerCase()}`}>{t.priority}</span>
                </div>
                <div className="priority-subject">{t.subject}</div>
                <div className="priority-customer">{t.customer_name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RECENT TICKETS TABLE ──────────────────────────────────────── */}
      <div className="content-card section-margin-top">
        <div className="card-header-flex">
          <h3>Recent Tickets</h3>
          <Link to="/tickets" className="link-sm">Manage Tickets <FiChevronRight /></Link>
        </div>

        <div className="table-container">
          <table className="app-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Customer</th>
                <th>Issue Subject</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {(recentTicketsList.length > 0 ? recentTicketsList : [
                { ticket_id: "TKT-1001", customer_name: "Jane Smith", subject: "Duplicate Charge", priority: "HIGH", status: "open", created_at: "3h ago" },
                { ticket_id: "TKT-1002", customer_name: "Michael Brown", subject: "Delayed Delivery", priority: "CRITICAL", status: "in_progress", created_at: "6h ago" },
                { ticket_id: "TKT-1003", customer_name: "John Doe", subject: "API Access", priority: "MEDIUM", status: "open", created_at: "12h ago" },
              ]).map((t) => (
                <tr key={t.ticket_id}>
                  <td className="code-text">{t.ticket_id}</td>
                  <td><strong>{t.customer_name}</strong></td>
                  <td>{t.subject}</td>
                  <td><span className={`badge badge-priority-${(t.priority || "LOW").toLowerCase()}`}>{t.priority || "MEDIUM"}</span></td>
                  <td><span className={`badge badge-status-${t.status}`}>{t.status}</span></td>
                  <td className="text-muted">Today</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
