import { useState } from "react";
import { FaTicketAlt, FaPaperPlane, FaCheckCircle } from "react-icons/fa";
import { createTicket } from "../services/api";
import "../styles/WebPortal.css";

function WebPortal() {
  const [form, setForm] = useState({
    customer_name: "",
    customer_id: "",
    subject: "",
    description: "",
    category: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const data = await createTicket(form);
      setResult(data);
      setForm({
        customer_name: "",
        customer_id: "",
        subject: "",
        description: "",
        category: "",
      });
    } catch {
      setError("Failed to submit ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="portal-page">
      <div className="portal-container">
        <div className="portal-header">
          <FaTicketAlt className="portal-icon" />
          <div>
            <h1>Create Support Ticket</h1>
            <p>Submit your issue and our AI will analyze and process it.</p>
          </div>
        </div>

        {result && (
          <div className="success-banner">
            <FaCheckCircle />
            <div>
              <strong>Ticket Created Successfully!</strong>
              <p>Ticket ID: <code>{result.ticket_id}</code> — Status: {result.status}</p>
            </div>
            <button className="btn-dismiss" onClick={() => setResult(null)}>×</button>
          </div>
        )}

        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button className="btn-dismiss" onClick={() => setError(null)}>×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="portal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="customer_name">Your Name</label>
              <input
                type="text"
                id="customer_name"
                name="customer_name"
                value={form.customer_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="customer_id">Customer ID <span className="optional">(optional)</span></label>
              <input
                type="text"
                id="customer_id"
                name="customer_id"
                value={form.customer_id}
                onChange={handleChange}
                placeholder="e.g., CUST-001"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
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
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                <option value="login_issue">Login Issue</option>
                <option value="payment_issue">Payment Issue</option>
                <option value="order_problem">Order Problem</option>
                <option value="delivery_issue">Delivery Issue</option>
                <option value="refund">Refund Request</option>
                <option value="technical_problem">Technical Problem</option>
                <option value="account_issue">Account Issue</option>
                <option value="cancellation">Cancellation</option>
                <option value="general_question">General Question</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="5"
              value={form.description}
              onChange={handleChange}
              placeholder="Please describe your issue in detail..."
              required
            />
          </div>

          <button
            className="btn btn-submit"
            type="submit"
            disabled={submitting}
            id="submit-ticket-btn"
          >
            {submitting ? (
              <span className="btn-loading">Processing...</span>
            ) : (
              <>
                <FaPaperPlane /> Submit Ticket
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default WebPortal;
