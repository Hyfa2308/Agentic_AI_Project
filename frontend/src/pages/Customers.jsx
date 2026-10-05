import { useState, useEffect } from "react";
import { FiUsers, FiSearch, FiX, FiCheckCircle } from "react-icons/fi";
import { getCustomers } from "../services/api";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    getCustomers()
      .then((data) => {
        if (data && data.customers) setCustomers(data.customers);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="view-container animate-fade-in">
      <div className="view-header">
        <div>
          <h2 className="view-title">Customers</h2>
          <p className="view-subtitle">View customer profiles, tiers, and interaction history.</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input-box">
          <FiSearch className="icon" />
          <input
            type="text"
            placeholder="Search customers by name, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="app-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Plan Tier</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.customer_id} className="table-row-clickable" onClick={() => setSelectedCustomer(c)}>
                <td className="code-text">{c.customer_id}</td>
                <td><strong>{c.name}</strong></td>
                <td>{c.email}</td>
                <td>{c.phone || "+1-555-0199"}</td>
                <td><span className="badge badge-priority-medium">{c.plan_tier.toUpperCase()}</span></td>
                <td>
                  <button className="btn-table-sm" onClick={(e) => { e.stopPropagation(); setSelectedCustomer(c); }}>
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCustomer && (
        <div className="modal-backdrop" onClick={() => setSelectedCustomer(null)}>
          <div className="modal-drawer-sm animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-panel-header">
              <h3>{selectedCustomer.name}</h3>
              <button onClick={() => setSelectedCustomer(null)} className="btn-close"><FiX /></button>
            </div>

            <div className="drawer-content">
              <div className="meta-item">
                <span className="lbl">Customer ID</span>
                <span className="val code-text">{selectedCustomer.customer_id}</span>
              </div>
              <div className="meta-item">
                <span className="lbl">Email</span>
                <span className="val">{selectedCustomer.email}</span>
              </div>
              <div className="meta-item">
                <span className="lbl">Plan Tier</span>
                <span className="val"><span className="badge badge-priority-medium">{selectedCustomer.plan_tier.toUpperCase()}</span></span>
              </div>

              <div className="section-margin-top">
                <h4>Recent Interactions</h4>
                <ul className="simple-list">
                  <li>TKT-1001: Duplicate Charge Dispute (Open)</li>
                  <li>CONV-DEMO-001: Order status query (Resolved)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
