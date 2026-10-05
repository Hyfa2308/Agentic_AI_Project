import { useState, useEffect } from "react";
import { FiSearch, FiFilter, FiCheckCircle, FiEdit3, FiX } from "react-icons/fi";
import { getTickets, updateTicket } from "../services/api";

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTicketsList = async () => {
    try {
      const data = await getTickets();
      if (data && data.tickets) setTickets(data.tickets);
    } catch (e) {
      console.error("Error fetching tickets:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketsList();
  }, []);

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      await updateTicket(ticketId, { status: newStatus });
      setTickets((prev) => prev.map((t) => (t.ticket_id === ticketId ? { ...t, status: newStatus } : t)));
      if (selectedTicket && selectedTicket.ticket_id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (e) {
      console.error("Error updating status:", e);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticket_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || (t.priority || "LOW") === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="view-container animate-fade-in">
      <div className="view-header">
        <div>
          <h2 className="view-title">Tickets</h2>
          <p className="view-subtitle">Manage customer support requests and escalations.</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar">
        <div className="search-input-box">
          <FiSearch className="icon" />
          <input
            type="text"
            placeholder="Search tickets by ID, name, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-box">
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="escalated">Escalated</option>
        </select>

        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="select-box">
          <option value="all">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      {/* Ticket Table */}
      <div className="table-container">
        <table className="app-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Customer</th>
              <th>Subject</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((t) => (
              <tr key={t.ticket_id} className="table-row-clickable" onClick={() => setSelectedTicket(t)}>
                <td className="code-text">{t.ticket_id}</td>
                <td><strong>{t.customer_name}</strong></td>
                <td>{t.subject}</td>
                <td><span className={`badge badge-priority-${(t.priority || "LOW").toLowerCase()}`}>{t.priority || "MEDIUM"}</span></td>
                <td><span className={`badge badge-status-${t.status}`}>{t.status}</span></td>
                <td className="text-muted">Today</td>
                <td>
                  <button className="btn-table-sm" onClick={(e) => { e.stopPropagation(); setSelectedTicket(t); }}>
                    Inspect
                  </button>
                </td>
              </tr>
            ))}
            {filteredTickets.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-muted">No tickets matching the specified filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* TICKET DETAIL TWO-COLUMN PANEL */}
      {selectedTicket && (
        <div className="modal-backdrop" onClick={() => setSelectedTicket(null)}>
          <div className="modal-panel-two-col animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-panel-header">
              <div>
                <h2>{selectedTicket.subject}</h2>
                <span className="code-text">{selectedTicket.ticket_id}</span>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="btn-close"><FiX /></button>
            </div>

            <div className="two-col-grid">
              {/* MAIN: Timeline & Context */}
              <div className="main-col">
                <div className="detail-section">
                  <label>Customer Issue Description</label>
                  <p className="desc-box">{selectedTicket.description}</p>
                </div>

                {selectedTicket.escalation_reason && (
                  <div className="detail-section alert">
                    <label>Escalation Reason</label>
                    <p>{selectedTicket.escalation_reason}</p>
                  </div>
                )}
              </div>

              {/* RIGHT: Ticket Metadata & Actions */}
              <div className="right-col">
                <div className="meta-box">
                  <div className="meta-item">
                    <span className="lbl">Customer</span>
                    <span className="val">{selectedTicket.customer_name} ({selectedTicket.customer_id || "N/A"})</span>
                  </div>
                  <div className="meta-item">
                    <span className="lbl">Priority</span>
                    <span className={`val badge badge-priority-${(selectedTicket.priority || "LOW").toLowerCase()}`}>{selectedTicket.priority || "MEDIUM"}</span>
                  </div>
                  <div className="meta-item">
                    <span className="lbl">Status</span>
                    <span className={`val badge badge-status-${selectedTicket.status}`}>{selectedTicket.status}</span>
                  </div>
                </div>

                <div className="action-box">
                  <label>Update Status:</label>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(selectedTicket.ticket_id, e.target.value)}
                    className="select-box full-width"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="escalated">Escalated</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
