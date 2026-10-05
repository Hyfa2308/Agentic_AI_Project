import { Link } from "react-router-dom";
import { FiMessageSquare, FiShield, FiBarChart2, FiCpu, FiTrendingUp, FiCheckCircle, FiZap, FiLayers, FiLock, FiDatabase } from "react-icons/fi";
import ArchitectureDiagram from "../components/ArchitectureDiagram";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <FiZap /> Next-Generation AI Support & Escalation Engine
        </div>
        <h1 className="hero-title">
          Intelligent Customer Support.<br />
          <span className="gradient-text">Understood. Resolved. Escalated.</span>
        </h1>
        <p className="hero-subtitle">
          AssistIQ is an enterprise-grade AI customer sentiment and escalation platform powered by multi-agent LangGraph workflows, real-time sentiment analysis, ChromaDB RAG knowledge search, and dynamic human support escalation.
        </p>
        
        <div className="hero-cta-group">
          <Link to="/chat" className="btn-primary-lg">
            <FiMessageSquare /> Launch Web Chat
          </Link>
          <Link to="/dashboard" className="btn-secondary-lg">
            <FiBarChart2 /> Support Agent Dashboard
          </Link>
          <Link to="/portal" className="btn-outline-lg">
            <FiShield /> Submit Ticket
          </Link>
        </div>

        {/* Hero Quick Stats */}
        <div className="hero-stats-grid">
          <div className="stat-card">
            <div className="stat-number">10</div>
            <div className="stat-label">Specialized AI Agents</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">&lt; 1.5s</div>
            <div className="stat-label">Average Response Time</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">98.4%</div>
            <div className="stat-label">Intent Accuracy</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">4.8/5</div>
            <div className="stat-label">Customer Satisfaction</div>
          </div>
        </div>
      </section>

      {/* Architecture Visualization Section */}
      <section className="section-container">
        <div className="section-header">
          <h2>Reference Multi-Agent Architecture</h2>
          <p>Every customer interaction is processed through a deterministic multi-agent state graph.</p>
        </div>
        <ArchitectureDiagram />
      </section>

      {/* Core Platform Features Grid */}
      <section className="section-container">
        <div className="section-header">
          <h2>Enterprise Capabilities</h2>
          <p>Built from the ground up for high-velocity customer support teams.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon purple"><FiMessageSquare /></div>
            <h3>ChatGPT-Style Multi-Turn Chat</h3>
            <p>Maintains persistent conversation memory across follow-ups, remembering order IDs, context, and previous statements naturally.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon amber"><FiTrendingUp /></div>
            <h3>Sentiment Intelligence</h3>
            <p>Classifies emotional tone into Happy, Neutral, Frustrated, and Angry, tracking sentiment changes across conversation turns.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon red"><FiShield /></div>
            <h3>Smart Human Escalation</h3>
            <p>Evaluates severity, billing disputes, and anger triggers using configurable business rules to dynamically create TKT-XXXX escalation cases.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon cyan"><FiCpu /></div>
            <h3>Knowledge Agent (RAG)</h3>
            <p>Queries ChromaDB vector embeddings for company policies, FAQs, and SOPs to generate grounded, hallucination-free answers.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon green"><FiDatabase /></div>
            <h3>PostgreSQL Customer Context</h3>
            <p>Retrieves verified customer account profiles, plan tiers (Enterprise, Premium, Standard), and interaction history automatically.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon blue"><FiLayers /></div>
            <h3>Human Support Dashboard</h3>
            <p>Full-featured management interface for support agents to inspect live conversations, assign escalated tickets, and view analytics.</p>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="cta-banner">
        <div className="cta-content">
          <h2>Ready to experience the future of AI Customer Support?</h2>
          <p>Test real-time multi-turn conversation memory, intent detection, and automated ticket escalation now.</p>
          <div className="cta-buttons">
            <Link to="/chat" className="btn-primary-lg"><FiMessageSquare /> Try Web Chat Demo</Link>
            <Link to="/portal" className="btn-secondary-lg"><FiShield /> Support Portal</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
