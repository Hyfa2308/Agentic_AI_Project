import { Link } from "react-router-dom";
import { FiZap, FiCheckCircle, FiShield, FiMessageSquare, FiTrendingUp, FiCpu, FiArrowRight } from "react-icons/fi";
import ArchitectureDiagram from "../components/ArchitectureDiagram";
import Footer from "../components/Footer";

const LandingPage = () => {
  return (
    <div className="public-landing-wrapper">
      {/* Public Header Navbar */}
      <header className="public-header">
        <div className="public-header-inner">
          <Link to="/" className="public-logo">
            <div className="logo-icon"><FiZap /></div>
            <span className="logo-text">AssistIQ</span>
          </Link>

          <nav className="public-nav">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#architecture">Architecture</a>
            <Link to="/about">About</Link>
          </nav>

          <div className="public-nav-actions">
            <Link to="/signin" className="btn-link">Sign In</Link>
            <Link to="/signup" className="btn-primary-sm">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="public-hero">
        <div className="hero-content">
          <div className="hero-pill">
            <FiZap /> Enterprise AI Customer Intelligence
          </div>
          <h1 className="hero-headline">
            AI-Powered Customer Support<br />
            <span className="blue-gradient-text">That Understands, Resolves & Escalates.</span>
          </h1>
          <p className="hero-description">
            AssistIQ combines conversational AI, sentiment intelligence, customer context, knowledge retrieval, and intelligent escalation to help organizations deliver faster and smarter customer support.
          </p>

          <div className="hero-buttons">
            <Link to="/signup" className="btn-primary-lg">
              Get Started Free <FiArrowRight />
            </Link>
            <Link to="/signin" className="btn-secondary-lg">
              Sign In to Workspace
            </Link>
          </div>
        </div>

        {/* Workspace Product Preview Mockup */}
        <div className="workspace-preview-box">
          <div className="preview-top-bar">
            <div className="window-dots">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </div>
            <span className="preview-url">app.assistiq.io/app/dashboard</span>
          </div>

          <div className="preview-app-mockup">
            <div className="mock-sidebar">
              <div className="mock-logo"><FiZap /> AssistIQ</div>
              <div className="mock-item active"><FiZap /> Dashboard</div>
              <div className="mock-item"><FiMessageSquare /> Conversations</div>
              <div className="mock-item"><FiShield /> Tickets</div>
              <div className="mock-item"><FiCpu /> Knowledge Base</div>
            </div>

            <div className="mock-main">
              <div className="mock-header">
                <strong>Support Operations Overview</strong>
                <span className="badge badge-status-resolved">AI Engine Online</span>
              </div>

              <div className="mock-stats">
                <div className="mock-stat">
                  <span className="lbl">Open Tickets</span>
                  <span className="val">8</span>
                </div>
                <div className="mock-stat">
                  <span className="lbl">Active Chats</span>
                  <span className="val">14</span>
                </div>
                <div className="mock-stat">
                  <span className="lbl">Escalated</span>
                  <span className="val text-danger">5</span>
                </div>
                <div className="mock-stat">
                  <span className="lbl">CSAT Rating</span>
                  <span className="val text-success">4.8 / 5.0</span>
                </div>
              </div>

              <div className="mock-table">
                <div className="mock-table-row header">
                  <span>Customer</span>
                  <span>Issue Subject</span>
                  <span>Sentiment</span>
                  <span>Status</span>
                </div>
                <div className="mock-table-row">
                  <strong>Jane Smith</strong>
                  <span>Duplicate Payment Charge #ORD5921</span>
                  <span className="badge badge-sentiment-angry">Angry</span>
                  <span className="badge badge-status-escalated">Escalated</span>
                </div>
                <div className="mock-table-row">
                  <strong>Michael Brown</strong>
                  <span>Delayed Delivery breach</span>
                  <span className="badge badge-sentiment-frustrated">Frustrated</span>
                  <span className="badge badge-status-in_progress">In Progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="public-section">
        <div className="section-title-center">
          <h2>Purpose-Built for Modern Helpdesks</h2>
          <p>Deliver enterprise support with full context, sentiment awareness, and human-in-the-loop escalation.</p>
        </div>

        <div className="public-features-grid">
          <div className="public-feature-card">
            <div className="icon-box blue"><FiMessageSquare /></div>
            <h3>Conversational AI</h3>
            <p>Maintains multi-turn context memory across messages, remembering order numbers and previous statements.</p>
          </div>

          <div className="public-feature-card">
            <div className="icon-box amber"><FiTrendingUp /></div>
            <h3>Sentiment Intelligence</h3>
            <p>Classifies emotional tone into Happy, Neutral, Frustrated, and Angry to prioritize high-risk complaints.</p>
          </div>

          <div className="public-feature-card">
            <div className="icon-box red"><FiShield /></div>
            <h3>Smart Escalation Engine</h3>
            <p>Evaluates billing disputes, security alerts, and customer anger using business rules to generate dynamic TKT-XXXX cases.</p>
          </div>

          <div className="public-feature-card">
            <div className="icon-box purple"><FiCpu /></div>
            <h3>Vector Knowledge RAG</h3>
            <p>Searches ChromaDB embeddings for company policies and SOPs to generate grounded, hallucination-free answers.</p>
          </div>
        </div>
      </section>

      {/* Architecture Visualizer Section */}
      <section id="architecture" className="public-section">
        <div className="section-title-center">
          <h2>Reference Multi-Agent Pipeline</h2>
          <p>Explore the 10-node LangGraph orchestration state machine powering AssistIQ.</p>
        </div>
        <ArchitectureDiagram />
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
