import { NavLink } from "react-router-dom";
import { FaRobot } from "react-icons/fa";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="logo">
        <div className="logo-icon-wrapper">
          <FaRobot className="logo-icon" />
        </div>
        <div>
          <h2>AssistIQ</h2>
          <p>AI Customer Support</p>
        </div>
      </NavLink>

      <div className="nav-links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/chat">AI Chat</NavLink>
        <NavLink to="/portal">Support Portal</NavLink>
        <NavLink to="/dashboard">Agent Dashboard</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
