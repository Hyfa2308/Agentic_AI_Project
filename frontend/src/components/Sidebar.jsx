import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  FiGrid, FiMessageSquare, FiFileText, FiUsers, FiBook, 
  FiBarChart2, FiExternalLink, FiSettings, FiZap, FiShield, FiLogOut
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const workspaceNav = [
    { path: "/app/dashboard", label: "Dashboard", icon: <FiGrid /> },
    { path: "/app/conversations", label: "Conversations", icon: <FiMessageSquare /> },
    { path: "/app/tickets", label: "Tickets", icon: <FiFileText /> },
    { path: "/app/customers", label: "Customers", icon: <FiUsers /> },
  ];

  const knowledgeNav = [
    { path: "/app/knowledge", label: "Knowledge Base", icon: <FiBook /> },
  ];

  const insightsNav = [
    { path: "/app/analytics", label: "Analytics", icon: <FiBarChart2 /> },
  ];

  const channelNav = [
    { path: "/app/chat", label: "Web Chat", icon: <FiZap /> },
    { path: "/app/support", label: "Support Portal", icon: <FiShield /> },
  ];

  const handleSignOut = () => {
    logout();
    navigate("/signin");
  };

  return (
    <aside className="app-sidebar">
      {/* Brand Logo */}
      <Link to="/app/dashboard" className="sidebar-brand">
        <div className="brand-logo-icon">
          <FiZap />
        </div>
        <span className="brand-name">AssistIQ</span>
      </Link>

      {/* WORKSPACE */}
      <div className="sidebar-section">
        <span className="sidebar-section-title">WORKSPACE</span>
        <nav className="sidebar-nav">
          {workspaceNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* KNOWLEDGE */}
      <div className="sidebar-section">
        <span className="sidebar-section-title">KNOWLEDGE</span>
        <nav className="sidebar-nav">
          {knowledgeNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* INSIGHTS */}
      <div className="sidebar-section">
        <span className="sidebar-section-title">INSIGHTS</span>
        <nav className="sidebar-nav">
          {insightsNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* CHANNELS */}
      <div className="sidebar-section">
        <span className="sidebar-section-title">CHANNELS</span>
        <nav className="sidebar-nav">
          {channelNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                <FiExternalLink className="ext-icon" />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Settings */}
      <div className="sidebar-footer">
        <Link
          to="/app/settings"
          className={`sidebar-nav-item ${location.pathname === "/app/settings" ? "active" : ""}`}
        >
          <FiSettings className="nav-icon" />
          <span className="nav-label">Settings</span>
        </Link>

        <div className="sidebar-user">
          <div className="user-avatar">{user?.name ? user.name.charAt(0) : "A"}</div>
          <div className="user-info">
            <span className="user-name">{user?.name || "Support Admin"}</span>
            <span className="user-role">{user?.role || "Tier-2 Specialist"}</span>
          </div>
          <button onClick={handleSignOut} className="btn-signout" title="Sign Out">
            <FiLogOut />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
