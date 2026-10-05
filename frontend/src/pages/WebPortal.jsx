import { useState } from "react";
import { FiShield, FiSend, FiCheckCircle, FiSearch } from "react-icons/fi";
import { createTicket, getTicket } from "../services/api";

const WebPortal = () => {
  const [activeTab, setActiveTab] = useState("submit"); // "submit" | "lookup"
  const [formData, setFormData] = useState({
    customer_name: "Jane Smith",
    customer_id: "CUST-1002",
    email: "jane.smith@example.com",
    order_id: "ORD5921",
    category: "billing",
    subject: "Duplicate Payment Charge - Order #ORD5921",
    description: "I was charged twice on my card for order ORD5921. Please refund the duplicate amount.",
  });
  const [submitting, setSubmitting] = useState(false);
  const [ticketResult, setTicketResult] = useState(null);

  const [searchId, setSearchId] = useState("");
  const [lookupResult, setLookupResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createTicket({
        customer_name: formData.customer_name,
        customer_id: formData.customer_id,
        subject: formData.subject,
        description: formData.description + (formData.order_id ? ` (Order ID: ${formData.order_id})` : ""),
        category: formData.category,
      });
      setTicketResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    try {
      const res = await getTicket(searchId.trim());
      setLookupResult(res);
    } catch (e) {
      setLookupResult(null);
    }
  };

  return (
    <div className="portal-page-wrapper animate-fade-in">
      <div className="portal-card-box">
        <div className="portal-nav-tabs">
          <button
            className={`tab-btn ${activeTab === "submit" ? "active" : ""}`}
            onClick={() => setActiveTab("submit")}
          >
            Submit Support Request
          </button>
          <button
            className={`tab-btn ${activeTab === "lookup" ? "active" : ""}`}
            onClick={() => setActiveTab("lookup")}
          >
            Track Existing Ticket
          </button>
        </div>

        {activeTab === "submit" ? (
          <div>
            <h2 className="portal-heading">Submit a Support Request</h2>
            <p className="portal-sub">Fill in the details below to dispatch your inquiry to support.</p>

            {ticketResult ? (
              <div className="ticket-success-card">
                <FiCheckCircle className="check-icon" />
                <h3>Ticket Created Successfully</h3>
                <div className="ticket-code-big">{ticketResult.ticket_id}</div>

                <div className="meta-grid">
                  <div><span className="lbl">Status</span> <span className="badge badge-status-open">{ticketResult.status}</span></div>
                  <div><span className="lbl">Priority</span> <span className="badge badge-priority-medium">{ticketResult.priority || "MEDIUM"}</span></div>
                </div>

                <button onClick={() => setTicketResult(null)} className="btn-secondary-sm margin-top">
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="portal-form">
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Order ID (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. ORD5921"
                      value={formData.order_id}
                      onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="billing">Billing & Payment</option>
                      <option value="logistics">Shipping & Delivery</option>
                      <option value="technical">Technical Support</option>
                      <option value="returns">Refund & Returns</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Detailed Description</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <button type="submit" disabled={submitting} className="btn-primary-md full-width">
                  {submitting ? "Submitting..." : <><FiSend /> Submit Request</>}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div>
            <h2 className="portal-heading">Track Existing Ticket</h2>
            <p className="portal-sub">Enter your ticket code to view real-time status.</p>

            <form onSubmit={handleLookup} className="search-bar-inline">
              <input
                type="text"
                placeholder="Enter Ticket ID (e.g. TKT-1001)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              <button type="submit" className="btn-primary-md">Lookup</button>
            </form>

            {lookupResult && (
              <div className="lookup-card">
                <h3>{lookupResult.subject}</h3>
                <span className="code-text">{lookupResult.ticket_id}</span>
                <div className="meta-grid">
                  <div><span className="lbl">Customer</span> <span className="val">{lookupResult.customer_name}</span></div>
                  <div><span className="lbl">Status</span> <span className="badge badge-status-open">{lookupResult.status}</span></div>
                  <div><span className="lbl">Priority</span> <span className="badge badge-priority-medium">{lookupResult.priority || "MEDIUM"}</span></div>
                </div>
                <p className="desc-box">{lookupResult.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WebPortal;
