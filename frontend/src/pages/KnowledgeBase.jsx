import { useState, useEffect } from "react";
import { FiBook, FiSearch, FiPlus, FiX } from "react-icons/fi";
import { getKnowledgeBase, uploadKnowledgeDoc } from "../services/api";

const KnowledgeBase = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "faq" });

  const fetchDocs = async () => {
    try {
      const data = await getKnowledgeBase();
      if (data && data.documents) setDocs(data.documents);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleAddDoc = async (e) => {
    e.preventDefault();
    try {
      await uploadKnowledgeDoc(form);
      setShowAddModal(false);
      setForm({ title: "", content: "", category: "faq" });
      fetchDocs();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = docs.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || (d.category || "faq") === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="view-container animate-fade-in">
      <div className="view-header flex-between">
        <div>
          <h2 className="view-title">Knowledge Base</h2>
          <p className="view-subtitle">Manage FAQs, company policies, and standard operating procedures (SOPs).</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary-sm">
          <FiPlus /> Add Document
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-box">
          <FiSearch className="icon" />
          <input
            type="text"
            placeholder="Search knowledge documents by keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)} className="select-box">
          <option value="all">All Categories</option>
          <option value="faq">FAQs</option>
          <option value="policy">Policies</option>
          <option value="sop">SOPs</option>
        </select>
      </div>

      <div className="table-container">
        <table className="app-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Category</th>
              <th>Preview Snippet</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(filtered.length > 0 ? filtered : [
              { doc_id: "doc_1", title: "Refund & Return Policy", category: "policy", content: "Customers are eligible for a 100% refund within 30 days..." },
              { doc_id: "doc_2", title: "Order Tracking FAQ", category: "faq", content: "To track your package, locate your order ID in the portal..." },
              { doc_id: "doc_3", title: "Escalation Standard Operating Procedure", category: "sop", content: "Billing disputes exceeding $200 must be routed to Tier-2..." },
            ]).map((d, i) => (
              <tr key={d.doc_id || i}>
                <td><strong>{d.title}</strong></td>
                <td><span className="badge badge-status-open">{(d.category || "policy").toUpperCase()}</span></td>
                <td className="truncate-text">{d.content}</td>
                <td><span className="badge badge-status-resolved">Indexed Vector</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-drawer-sm animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-panel-header">
              <h3>Add Knowledge Base Document</h3>
              <button onClick={() => setShowAddModal(false)} className="btn-close"><FiX /></button>
            </div>

            <form onSubmit={handleAddDoc} className="form-vertical">
              <div className="form-group">
                <label>Document Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="faq">FAQ</option>
                  <option value="policy">Policy</option>
                  <option value="sop">SOP</option>
                </select>
              </div>

              <div className="form-group">
                <label>Document Content</label>
                <textarea
                  required
                  rows={5}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-primary-sm full-width">Upload & Index</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
