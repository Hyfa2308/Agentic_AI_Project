import { useState } from "react";
import {
  FaTicketAlt,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
} from "react-icons/fa";
import { createTicket } from "../services/api";
import "../styles/WebPortal.css";

const CATEGORIES = [
  { value: "account_issue", label: "Account" },
  { value: "payment_issue", label: "Payment" },
  { value: "order_problem", label: "Order" },
  { value: "refund", label: "Refund" },
  { value: "technical_problem", label: "Technical" },
  { value: "cancellation", label: "Subscription" },
  { value: "security_issue", label: "Security" },
  { value: "general_question", label: "Other" },
];

function WebPortal() {
  const [form, setForm] = useState({
    customer_name: "",
    customer_id: "",
    email: "",
    category: "payment_issue",
    priority: "MEDIUM",
    subject: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name.trim() || !form.subject.trim() || !form.description.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const data = await createTicket(form);
      setResult(data);
      setForm({
        customer_name: "",
        customer_id: "",
        email: "",
        category: "payment_issue",
        priority: "MEDIUM",
        subject: "",
        description: "",
      });
    } catch {
      setError("Unable to submit support ticket. Please check your backend connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="portal-page">
      <div className="portal-container">
        {/* Page Header */}
        <div className="portal-header">
          <div className="portal-icon-wrapper">
            <FaTicketAlt />
          </div>
          <div>
            <h1>AssistIQ Support Portal</h1>
            <p>Submit a formal ticket to our intelligent AI support agent engine.</p>
          </div>
        </div>

        {/* Success Modal Notification Banner */}
        {result && (
          <div className="success-banner-card">
            <div className="banner-icon-success">
              <FaCheckCircle />
            </div>
            <div className="banner-details">
              <h3>✓ Ticket Created Successfully</h3>
              <p>Your support request has been recorded and submitted to our AI pipeline.</p>
              <div className="ticket-meta-grid">
                <div className="meta-box">
                  <span className="meta-label">Ticket ID:</span>
                  <span className="meta-val ticket-code">{result.ticket_id}</span>
                </div>
                <div className="meta-box">
                  <span className="meta-label">Status:</span>
                  <span className="meta-val status-open">{result.status}</span>
                </div>
                <div className="meta-box">
                  <span className="meta-label">Expected Response:</span>
                  <span className="meta-val response-eta">
                    <FaClock className="eta-icon" /> Within 24 hours
                  </span>
                </div>
              </div>
            </div>
            <button
              className="btn-close-banner"
              onClick={() => setResult(null)}
              aria-label="Dismiss success message"
            >
              ×
            </button>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="error-banner-card">
            <FaExclamationTriangle className="error-icon" />
            <span>{error}</span>
            <button className="btn-close-banner" onClick={() => setError(null)}>
              ×
            </button>
          </div>
        )}

        {/* Ticket Form */}
        <form onSubmit={handleSubmit} className="portal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="customer_name">
                Customer Name <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="customer_name"
                name="customer_name"
                value={form.customer_name}
                onChange={handleChange}
                placeholder="e.g., Sarah Connor"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="customer_id">Customer ID (Optional)</label>
              <input
                type="text"
                id="customer_id"
                name="customer_id"
                value={form.customer_id}
                onChange={handleChange}
                placeholder="e.g., CUST-1002"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address (Optional)</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="sarah@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Initial Priority</label>
              <select
                id="priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="subject">
              Subject <span className="required-star">*</span>
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Brief summary of your issue"
              required
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">
              Description <span className="required-star">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows="5"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your issue in detail. Our AI will analyze the problem, check sentiment urgency, and auto-route to the appropriate team..."
              required
            />
          </div>

          <button
            className="btn-submit-ticket"
            type="submit"
            disabled={submitting}
            id="create-ticket-button"
          >
            {submitting ? (
              <span className="btn-loading">Creating Support Ticket...</span>
            ) : (
              <>
                <FaPaperPlane /> Create Support Ticket
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default WebPortal;
