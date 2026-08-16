import { Link } from "react-router-dom";
import {
  FaRobot,
  FaBolt,
  FaUsers,
  FaChartLine,
  FaShieldAlt,
  FaBrain,
} from "react-icons/fa";
import "../styles/Home.css";

function Home() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">AI-Powered Support Platform</div>
          <h1>
            Customer Support,
            <br />
            <span className="gradient-text">Reimagined with AI</span>
          </h1>
          <p className="hero-subtitle">
            AssistIQ uses intelligent AI agents to understand customer sentiment,
            resolve issues instantly, and escalate complex problems to human
            support — all in real time.
          </p>
          <div className="hero-buttons">
            <Link to="/chat" className="btn btn-primary">
              <FaRobot /> Start AI Chat
            </Link>
            <Link to="/portal" className="btn btn-secondary">
              <FaShieldAlt /> Submit Ticket
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-value">10+</span>
              <span className="stat-label">AI Agents</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-value">&lt;2s</span>
              <span className="stat-label">Response Time</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-value">24/7</span>
              <span className="stat-label">Availability</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-card-header">
              <div className="pulse-dot" />
              <span>AI Agent Active</span>
            </div>
            <div className="hero-card-body">
              <FaBrain className="hero-brain-icon" />
              <p>Analyzing sentiment...</p>
              <div className="analysis-bars">
                <div className="bar-row">
                  <span>Intent</span>
                  <div className="bar"><div className="bar-fill" style={{ width: "85%" }} /></div>
                </div>
                <div className="bar-row">
                  <span>Sentiment</span>
                  <div className="bar"><div className="bar-fill bar-warning" style={{ width: "62%" }} /></div>
                </div>
                <div className="bar-row">
                  <span>Priority</span>
                  <div className="bar"><div className="bar-fill bar-danger" style={{ width: "90%" }} /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">How AssistIQ Works</h2>
        <p className="section-subtitle">
          Intelligent AI agents work together to deliver exceptional customer support
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FaBolt className="feature-icon" />
            </div>
            <h3>Instant AI Resolution</h3>
            <p>
              AI agents analyze your query, retrieve relevant knowledge, and
              generate accurate responses in seconds.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper icon-purple">
              <FaChartLine className="feature-icon" />
            </div>
            <h3>Sentiment Analysis</h3>
            <p>
              Real-time emotion detection ensures frustrated customers get
              priority attention and empathetic responses.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper icon-amber">
              <FaUsers className="feature-icon" />
            </div>
            <h3>Smart Escalation</h3>
            <p>
              Complex issues are automatically escalated to human agents with
              full AI-generated context and recommendations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
