import { FiLayers, FiCpu, FiDatabase, FiShield, FiZap, FiCheckCircle } from "react-icons/fi";
import ArchitectureDiagram from "../components/ArchitectureDiagram";
import Footer from "../components/Footer";

const About = () => {
  return (
    <div className="page-wrapper">
      <section className="about-hero">
        <div className="hero-badge"><FiLayers /> AssistIQ System Architecture</div>
        <h1>AI Multi-Agent Architecture & Design</h1>
        <p>Comprehensive overview of AssistIQ's 10-agent LangGraph workflow, sentiment escalation engine, and vector search RAG integration.</p>
      </section>

      <section className="section-container">
        <ArchitectureDiagram />
      </section>

      {/* Agents Deep Dive */}
      <section className="section-container">
        <div className="section-header">
          <h2>10 Specialized AI Agents</h2>
          <p>Every node in the state graph performs a dedicated reasoning step.</p>
        </div>

        <div className="agents-list-grid">
          {[
            { title: "1. LangGraph Orchestrator", icon: <FiLayers />, text: "Central workflow engine coordinating node execution, context propagation, and conditional routing between automated responses and human escalation." },
            { title: "2. Intent Agent", icon: <FiZap />, text: "Uses semantic LLM classification to categorize customer requests into greeting, order status, delayed delivery, refund, duplicate payment, security, and general inquiries." },
            { title: "3. Sentiment Agent", icon: <FiCpu />, text: "Classifies emotional sentiment (Happy, Neutral, Frustrated, Angry) and evaluates sentiment trajectory across consecutive message turns." },
            { title: "4. Customer Context Agent", icon: <FiDatabase />, text: "Retrieves customer account tier (Enterprise, Premium, Standard), email, phone, and historical ticket logs from PostgreSQL database." },
            { title: "5. Knowledge Agent (RAG)", icon: <FiDatabase />, text: "Performs cosine similarity vector search over ChromaDB knowledge embeddings to retrieve grounded policies, FAQs, and SOPs." },
            { title: "6. Priority Agent", icon: <FiShield />, text: "Calculates priority (LOW, MEDIUM, HIGH, CRITICAL) using intent severity, sentiment intensity, and customer account tier." },
            { title: "7. Decision Agent", icon: <FiCheckCircle />, text: "Evaluates business rules to decide whether the AI can resolve the query automatically or requires human escalation." },
            { title: "8. Response Agent", icon: <FiZap />, text: "Invokes the Shared LLM to generate an empathetic, context-aware, knowledge-grounded response for the customer." },
            { title: "9. Escalation Agent", icon: <FiShield />, text: "Generates dynamic ticket ID (TKT-XXXX), saves case into PostgreSQL, and alerts support agents via the Support Dashboard." },
            { title: "10. Feedback & Learning Agent", icon: <FiCheckCircle />, text: "Collects CSAT ratings and flags low-score responses for future knowledge base improvement." },
          ].map((agent, i) => (
            <div key={i} className="agent-detail-card">
              <div className="card-title">
                <span className="icon">{agent.icon}</span>
                <span>{agent.title}</span>
              </div>
              <p>{agent.text}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
