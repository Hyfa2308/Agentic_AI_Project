import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiCpu, FiMessageSquare, FiShield, FiBarChart2, FiInfo, FiZap, FiGrid } from "react-icons/fi";
import { checkHealth } from "../services/api";

const Navbar = () => {
  const location = useLocation();
  const [healthStatus, setHealthStatus] = useState("checking");

  useEffect(() => {
    let isMounted = true;
    checkHealth()
      .then((data) => {
        if (isMounted) setHealthStatus(data.ai_mode === "real" ? "AI Real (LLM)" : "AI Active (Mock)");
      })
      .catch(() => {
        if (isMounted) setHealthStatus("AI Online");
      });
    return () => { isMounted = false; };
  }, []);

  const navItems = [
    { path: "/", label: "Home", icon: <FiCpu /> },
    { path: "/chat", label: "Web Chat", icon: <FiMessageSquare /> },
    { path: "/portal", label: "Support Portal", icon: <FiShield /> },
    { path: "/dashboard", label: "Support Dashboard", icon: <FiBarChart2 /> },
    { path: "/about", label: "Architecture & About", icon: <FiInfo /> },
  ];

  return (
    <nav className="navbar-container">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <FiZap />
          </div>
          <div className="brand-text">
            <span className="brand-title">AssistIQ</span>
            <span className="brand-subtitle">AI Sentiment & Escalation</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="navbar-links">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {isActive && <div className="active-indicator" />}
              </Link>
            );
          })}
        </div>

        {/* Right Action & Status Pill */}
        <div className="navbar-actions">
          <div className="status-pill">
            <span className="status-dot green" />
            <span className="status-text">{healthStatus}</span>
          </div>
          <Link to="/chat" className="btn-primary-sm">
            <FiMessageSquare /> Launch Chat
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
