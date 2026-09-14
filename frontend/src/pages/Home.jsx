import { Link } from "react-router-dom";
import {
  FaRobot,
  FaBrain,
  FaShieldAlt,
  FaArrowRight,
  FaComments,
  FaDatabase,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSearch,
  FaBolt,
  FaSyncAlt,
} from "react-icons/fa";
import "../styles/Home.css";

function Home() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">AI-Powered Customer Support</div>
          <h1>
            Resolve Customer Issues Faster with <span className="gradient-text">Intelligent AI</span>
          </h1>
          <p className="hero-subtitle">
            AssistIQ uses multi-agent AI to understand customer intent, analyze sentiment, retrieve relevant knowledge, and intelligently resolve or escalate support requests.
          </p>

          <div className="hero-buttons">
            <Link to="/chat" className="btn btn-primary">
              <FaComments /> Start AI Chat
            </Link>
            <Link to="/portal" className="btn btn-secondary">
              <FaShieldAlt /> Submit a Ticket
            </Link>
          </div>
        </div>

        {/* Hero Visual: Workflow Dashboard Preview */}
        <div className="hero-visual">
          <div className="workflow-preview-card">
            <div className="preview-header">
              <div className="header-left">
                <span className="live-dot" />
                <span className="preview-title">AssistIQ Workflow Engine</span>
              </div>
              <span className="preview-tag">Multi-Agent Pipeline</span>
            </div>

            <div className="workflow-pipeline-visual">
              <div className="pipeline-step">
                <div className="step-icon step-blue"><FaComments /></div>
                <div className="step-info">
                  <strong>Customer Message</strong>
                  <span>"I was charged twice for my subscription"</span>
                </div>
              </div>

              <div className="pipeline-arrow"><FaArrowRight /></div>

              <div className="pipeline-step">
                <div className="step-icon step-purple"><FaBrain /></div>
                <div className="step-info">
                  <strong>Intent &amp; Sentiment</strong>
                  <span className="badge-tag tag-intent">Intent: duplicate_payment</span>
                  <span className="badge-tag tag-sentiment">Sentiment: frustrated</span>
                </div>
              </div>

              <div className="pipeline-arrow"><FaArrowRight /></div>

              <div className="pipeline-step">
                <div className="step-icon step-cyan"><FaDatabase /></div>
                <div className="step-info">
                  <strong>Knowledge Retrieval</strong>
                  <span>ChromaDB RAG matched SOP-Billing-02</span>
                </div>
              </div>

              <div className="pipeline-arrow"><FaArrowRight /></div>

              <div className="pipeline-step">
                <div className="step-icon step-amber"><FaBolt /></div>
                <div className="step-info">
                  <strong>AI Decision</strong>
                  <span className="badge-tag tag-high">Priority: HIGH</span>
                </div>
              </div>

              <div className="pipeline-arrow"><FaArrowRight /></div>

              <div className="pipeline-step">
                <div className="step-icon step-emerald"><FaExclamationTriangle /></div>
                <div className="step-info">
                  <strong>Resolution / Escalation</strong>
                  <span className="badge-tag tag-escalated">Ticket Generated: AI-1028</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Core Intelligence Features</h2>
          <p>Designed for fast resolution, zero hallucination, and empathetic customer care</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon bg-blue">
              <FaRobot />
            </div>
            <h3>AI Customer Assistant</h3>
            <p>
              Provides instant, conversational responses tuned to specific customer issues with support for multi-turn context memory.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon bg-purple">
              <FaBrain />
            </div>
            <h3>Sentiment Intelligence</h3>
            <p>
              Detects customer frustration and anger in real time, automatically escalating high-risk queries before customer satisfaction degrades.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon bg-cyan">
              <FaSearch />
            </div>
            <h3>Knowledge-Aware Responses</h3>
            <p>
              Uses Retrieval-Augmented Generation (RAG) over ChromaDB vector embeddings to deliver answers strictly grounded in official company policies.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon bg-emerald">
              <FaShieldAlt />
            </div>
            <h3>Intelligent Escalation</h3>
            <p>
              Seamlessly hands off complex billing or security disputes to human agents, generating structured ticket summaries and recommended actions.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="workflow-section">
        <div className="section-header">
          <h2>How AssistIQ Works</h2>
          <p>A step-by-step breakdown of automated query resolution</p>
        </div>

        <div className="workflow-steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h4>Request Ingestion</h4>
            <p>Customer sends a message through the AssistIQ Web Chat or submits a ticket via the Support Portal.</p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h4>Intent &amp; Emotion Analysis</h4>
            <p>Intent Agent classifies the problem while Sentiment Agent measures emotional tone and urgency.</p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h4>Context &amp; Vector RAG Retrieval</h4>
            <p>Context Agent pulls customer history while Knowledge Agent performs similarity search on ChromaDB.</p>
          </div>

          <div className="step-card">
            <div className="step-number">4</div>
            <h4>Decision &amp; Response Engine</h4>
            <p>Decision Agent determines if the AI can resolve automatically or needs human support escalation.</p>
          </div>
        </div>
      </section>

      {/* Built for Intelligent Support Section */}
      <section className="built-for-section">
        <div className="built-for-card">
          <div className="built-for-content">
            <h2>Built for Intelligent Support</h2>
            <p>
              AssistIQ transforms modern customer care by reducing agent workload, accelerating response times from hours to seconds, and ensuring zero customer complaint is left unresolved.
            </p>

            <div className="built-for-benefits">
              <div className="benefit-item">
                <FaCheckCircle className="check-icon" />
                <span>Zero Hallucination with RAG Grounding</span>
              </div>
              <div className="benefit-item">
                <FaCheckCircle className="check-icon" />
                <span>Structured Agent Handoff Summaries</span>
              </div>
              <div className="benefit-item">
                <FaCheckCircle className="check-icon" />
                <span>Full PostgreSQL &amp; ChromaDB History Storage</span>
              </div>
              <div className="benefit-item">
                <FaCheckCircle className="check-icon" />
                <span>Dual Execution Engine (Mock &amp; Production LLM)</span>
              </div>
            </div>

            <div className="built-for-cta">
              <Link to="/chat" className="btn btn-primary">Try Web Chat Demo</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
