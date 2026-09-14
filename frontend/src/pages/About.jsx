import React from "react";
import { Link } from "react-router-dom";
import {
  FaRobot,
  FaBrain,
  FaLightbulb,
  FaDatabase,
  FaShieldAlt,
  FaArrowRight,
  FaBolt,
  FaChartBar,
  FaServer,
  FaExchangeAlt,
} from "react-icons/fa";
import "../styles/About.css";

function About() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="about-hero-badge">About AssistIQ</div>
        <h1>
          Next-Generation AI Customer Support &amp; Escalation Platform
        </h1>
        <p className="about-hero-sub">
          AssistIQ combines multi-agent orchestration, sentiment intelligence, real-time vector knowledge retrieval (RAG), and automated escalation logic to solve customer problems faster and smarter.
        </p>
      </div>

      {/* Overview Section */}
      <section className="about-section">
        <div className="section-card">
          <div className="card-header-flex">
            <div className="icon-box bg-blue">
              <FaRobot />
            </div>
            <div>
              <h2>What is AssistIQ?</h2>
              <p className="card-subtitle">An enterprise-grade autonomous support engine</p>
            </div>
          </div>
          <p className="text-body">
            AssistIQ is an AI-powered customer support platform designed to handle complex support operations. Rather than relying on simple pattern matching or static decision trees, AssistIQ uses a pipeline of specialized AI agents built on <strong>LangGraph</strong>. Every customer request undergoes intent classification, sentiment analysis, context evaluation from PostgreSQL customer records, and similarity search over ChromaDB vector embeddings.
          </p>
        </div>
      </section>

      {/* How It Works Diagram */}
      <section className="about-section">
        <div className="section-title-wrapper">
          <h2>Multi-Agent Workflow</h2>
          <p>How a customer request moves through our autonomous agent network</p>
        </div>

        <div className="workflow-diagram">
          <div className="flow-step">
            <div className="step-circle step-1">
              <FaExchangeAlt />
            </div>
            <h4>1. Customer Input</h4>
            <p>Message sent via Web Chat or Support Portal</p>
          </div>

          <div className="flow-arrow"><FaArrowRight /></div>

          <div className="flow-step">
            <div className="step-circle step-2">
              <FaBrain />
            </div>
            <h4>2. Intent &amp; Sentiment</h4>
            <p>Identifies problem type &amp; emotional urgency</p>
          </div>

          <div className="flow-arrow"><FaArrowRight /></div>

          <div className="flow-step">
            <div className="step-circle step-3">
              <FaDatabase />
            </div>
            <h4>3. Context &amp; Knowledge</h4>
            <p>Fetches profile &amp; ChromaDB RAG docs</p>
          </div>

          <div className="flow-arrow"><FaArrowRight /></div>

          <div className="flow-step">
            <div className="step-circle step-4">
              <FaBolt />
            </div>
            <h4>4. Decision Engine</h4>
            <p>Determines auto-resolution vs. human escalation</p>
          </div>

          <div className="flow-arrow"><FaArrowRight /></div>

          <div className="flow-step">
            <div className="step-circle step-5">
              <FaShieldAlt />
            </div>
            <h4>5. Response / Escalation</h4>
            <p>Generates response or creates high-priority ticket</p>
          </div>
        </div>
      </section>

      {/* Technology Stack Grid */}
      <section className="about-section">
        <div className="section-title-wrapper">
          <h2>Technology Architecture</h2>
          <p>Built with enterprise technologies for speed, security, and scalability</p>
        </div>

        <div className="tech-grid">
          <div className="tech-card">
            <div className="tech-icon"><FaRobot /></div>
            <h3>Frontend UI</h3>
            <ul>
              <li>React.js (Vite)</li>
              <li>React Router v7</li>
              <li>Vanilla CSS &amp; CSS Variables</li>
              <li>Axios API Client</li>
              <li>React Icons</li>
            </ul>
          </div>

          <div className="tech-card">
            <div className="tech-icon"><FaServer /></div>
            <h3>Backend API</h3>
            <ul>
              <li>Python 3.11 / FastAPI</li>
              <li>Uvicorn ASGI Server</li>
              <li>Pydantic Schemas</li>
              <li>Async Connection Pooling</li>
              <li>Structured Request Logging</li>
            </ul>
          </div>

          <div className="tech-card">
            <div className="tech-icon"><FaBrain /></div>
            <h3>AI &amp; Agent Framework</h3>
            <ul>
              <li>LangGraph Agent Workflow</li>
              <li>OpenAI LLM Architecture</li>
              <li>Sentence Transformers</li>
              <li>ChromaDB Vector Store</li>
              <li>Deterministic Rule Fallbacks</li>
            </ul>
          </div>

          <div className="tech-card">
            <div className="tech-icon"><FaDatabase /></div>
            <h3>Database &amp; Storage</h3>
            <ul>
              <li>PostgreSQL / SQLite</li>
              <li>SQLAlchemy ORM</li>
              <li>Normalized Schema</li>
              <li>ChromaDB Persistence</li>
              <li>Customer History Tracking</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Future Scope */}
      <section className="about-section">
        <div className="section-card future-card">
          <div className="card-header-flex">
            <div className="icon-box bg-purple">
              <FaChartBar />
            </div>
            <div>
              <h2>Future Scope &amp; Expansion Roadmap</h2>
              <p className="card-subtitle">Upcoming integrations for enterprise deployment</p>
            </div>
          </div>
          <div className="future-grid">
            <div className="future-item">
              <span className="future-badge">Phase 2</span>
              <h4>Omnichannel Integration</h4>
              <p>Email (IMAP/SMTP), WhatsApp Business API, and Voice Call agent adapters.</p>
            </div>
            <div className="future-item">
              <span className="future-badge">Phase 2</span>
              <h4>Agent Performance Analytics</h4>
              <p>Live CSAT metrics, SLA countdown monitors, and AI accuracy benchmarks.</p>
            </div>
            <div className="future-item">
              <span className="future-badge">Phase 3</span>
              <h4>Automated Fine-Tuning</h4>
              <p>Feedback-driven RLHF loop to auto-improve prompt performance over time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="about-cta">
        <h2>Experience AssistIQ in Action</h2>
        <p>Try our interactive Web Chat or submit a support ticket to see intelligent escalation in real time.</p>
        <div className="cta-buttons">
          <Link to="/chat" className="btn btn-primary">Start AI Chat</Link>
          <Link to="/portal" className="btn btn-secondary">Submit a Ticket</Link>
        </div>
      </div>
    </div>
  );
}

export default About;
