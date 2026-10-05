import { useState } from "react";
import { FiUser, FiSliders, FiBell, FiShield, FiCpu, FiSave } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [toast, setToast] = useState(null);

  const [profileData, setProfileData] = useState({
    name: user?.name || "Support Admin",
    email: user?.email || "agent@assistiq.io",
    organization: user?.organization || "Enterprise Customer Support",
    aiMode: "real",
    autoEscalateThreshold: "HIGH",
  });

  const handleSave = (e) => {
    e.preventDefault();
    setToast({ type: "success", message: "Workspace settings updated successfully!" });
  };

  return (
    <div className="view-container animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="view-header">
        <div>
          <h2 className="view-title">Settings</h2>
          <p className="view-subtitle">Manage workspace configuration, user preferences, and AI pipeline parameters.</p>
        </div>
      </div>

      <div className="portal-card-box">
        <div className="portal-nav-tabs">
          <button
            className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <FiUser /> Profile & Org
          </button>
          <button
            className={`tab-btn ${activeTab === "ai" ? "active" : ""}`}
            onClick={() => setActiveTab("ai")}
          >
            <FiCpu /> AI Pipeline Settings
          </button>
          <button
            className={`tab-btn ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <FiShield /> Security
          </button>
        </div>

        <form onSubmit={handleSave} className="portal-form">
          {activeTab === "profile" && (
            <div className="form-vertical">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Work Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Organization Name</label>
                <input
                  type="text"
                  value={profileData.organization}
                  onChange={(e) => setProfileData({ ...profileData, organization: e.target.value })}
                />
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="form-vertical">
              <div className="form-group">
                <label>AI Execution Mode</label>
                <select
                  value={profileData.aiMode}
                  onChange={(e) => setProfileData({ ...profileData, aiMode: e.target.value })}
                >
                  <option value="real">Real OpenAI LLM Orchestration</option>
                  <option value="mock">Deterministic Test / Mock Mode</option>
                </select>
              </div>

              <div className="form-group">
                <label>Automatic Escalation Priority Threshold</label>
                <select
                  value={profileData.autoEscalateThreshold}
                  onChange={(e) => setProfileData({ ...profileData, autoEscalateThreshold: e.target.value })}
                >
                  <option value="CRITICAL">Critical Priority Only</option>
                  <option value="HIGH">High & Critical Priority</option>
                  <option value="MEDIUM">Medium, High & Critical</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="form-vertical">
              <div className="meta-item">
                <span className="lbl">API Key Encryption</span>
                <span className="val badge badge-status-resolved">AES-256 Enabled</span>
              </div>
              <div className="meta-item">
                <span className="lbl">Role Access Control</span>
                <span className="val badge badge-priority-medium">Tier-2 Admin</span>
              </div>
            </div>
          )}

          <div className="margin-top">
            <button type="submit" className="btn-primary-md">
              <FiSave /> Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
