import { Link } from "react-router-dom";
import { FiZap, FiGithub, FiLayers, FiShield, FiDatabase } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="brand-logo">
            <FiZap /> <span>AssistIQ</span>
          </div>
          <p className="footer-desc">
            Enterprise Multi-Agent Customer Support & Sentiment Escalation Platform powered by FastAPI, LangGraph, ChromaDB, and OpenAI.
          </p>
          <div className="footer-tech-stack">
            <span><FiLayers /> LangGraph</span>
            <span><FiDatabase /> ChromaDB</span>
            <span><FiShield /> Enterprise Security</span>
          </div>
        </div>

        <div className="footer-links-grid">
          <div className="footer-col">
            <h4>Platform</h4>
            <Link to="/chat">Web Chat</Link>
            <Link to="/portal">Customer Support Portal</Link>
            <Link to="/dashboard">Support Agent Dashboard</Link>
          </div>
          <div className="footer-col">
            <h4>Architecture</h4>
            <Link to="/about">System Architecture</Link>
            <Link to="/about#agents">Multi-Agent Workflow</Link>
            <Link to="/about#rag">Knowledge RAG</Link>
          </div>
          <div className="footer-col">
            <h4>Agents</h4>
            <span className="footer-muted">Intent Agent</span>
            <span className="footer-muted">Sentiment Agent</span>
            <span className="footer-muted">Customer Context Agent</span>
            <span className="footer-muted">Decision & Escalation Agent</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} AssistIQ AI Platform. All rights reserved.</p>
        <span className="badge badge-status-in_progress">Enterprise Prototype</span>
      </div>
    </footer>
  );
};

export default Footer;
