import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaRobot, FaBars, FaTimes } from "react-icons/fa";
import "../styles/Navbar.css";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="logo" onClick={closeMobileMenu}>
          <div className="logo-icon-wrapper">
            <FaRobot className="logo-icon" />
          </div>
          <div className="logo-text">
            <h2>AssistIQ</h2>
            <p>AI Support Platform</p>
          </div>
        </NavLink>

        <div className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
          <NavLink to="/" end onClick={closeMobileMenu}>
            Home
          </NavLink>
          <NavLink to="/chat" onClick={closeMobileMenu}>
            Web Chat
          </NavLink>
          <NavLink to="/portal" onClick={closeMobileMenu}>
            Support Portal
          </NavLink>
          <NavLink to="/about" onClick={closeMobileMenu}>
            About
          </NavLink>
          <NavLink to="/dashboard" onClick={closeMobileMenu} className="nav-dashboard-link">
            Agent Dashboard
          </NavLink>
        </div>

        <div className="navbar-right">
          <div className="ai-status-indicator" title="AssistIQ Multi-Agent Engine Status">
            <span className="status-pulse-dot" />
            <span className="status-text">AI Online</span>
          </div>

          <button
            className="hamburger-menu"
            onClick={toggleMobileMenu}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
