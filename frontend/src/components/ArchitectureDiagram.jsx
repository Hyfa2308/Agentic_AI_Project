import { useState } from "react";
import { FiUser, FiGlobe, FiServer, FiLayers, FiZap, FiDatabase, FiCheckCircle, FiAlertTriangle, FiCpu } from "react-icons/fi";

const ArchitectureDiagram = () => {
  const [selectedAgent, setSelectedAgent] = useState("LangGraph Orchestrator");

  const agentsInfo = {
    "LangGraph Orchestrator": "Central workflow engine coordinating all AI node executions, conditional routing, and state transitions.",
    "Intent Agent": "Semantic customer intent detection (e.g. greeting, delayed delivery, refund, billing dispute, security).",
    "Sentiment Agent": "Real-time emotional sentiment classification (Happy, Neutral, Frustrated, Angry) and sentiment trajectory analysis.",
    "Customer Context Agent": "Fetches customer profiles, order numbers, and historical ticket data from PostgreSQL database.",
    "Knowledge Agent (RAG)": "Performs ChromaDB vector search to retrieve company policies, FAQs, and SOP knowledge chunks.",
    "Priority Agent": "Calculates ticket priority (LOW, MEDIUM, HIGH, CRITICAL) using intent, sentiment, customer tier, and business rules.",
    "Decision Agent": "Evaluates whether query can be automated by AI or requires human support escalation.",
    "Response Agent": "Generates natural, empathetic, knowledge-grounded response for the customer using Shared LLM.",
    "Escalation Agent": "Generates dynamic ticket ID (TKT-XXXX) and dispatches ticket to Support Agent Dashboard.",
    "Feedback & Learning Agent": "Collects customer CSAT ratings and flags low-score responses for future knowledge base improvement.",
  };

  return (
    <div className="arch-container">
      <div className="arch-header">
        <h3>System Architecture & Multi-Agent Flow</h3>
        <p>Click any component below to view its specific runtime responsibility.</p>
      </div>

      <div className="arch-flow">
        {/* Layer 1: Input */}
        <div className="arch-layer">
          <div className="layer-title">Input Channels</div>
          <div className="arch-card channel">
            <FiUser className="arch-icon" />
            <span>Customer Request (Web Chat / Portal)</span>
          </div>
        </div>

        <div className="arch-arrow">↓</div>

        {/* Layer 2: Web & Backend */}
        <div className="arch-layer horiz">
          <div className="arch-card app">
            <FiGlobe className="arch-icon" />
            <span>React Frontend</span>
          </div>
          <span className="arch-connector">→</span>
          <div className="arch-card app">
            <FiServer className="arch-icon" />
            <span>FastAPI Backend</span>
          </div>
        </div>

        <div className="arch-arrow">↓</div>

        {/* Layer 3: LangGraph & Agents */}
        <div className="arch-layer box-group">
          <div className="layer-title">LangGraph Multi-Agent Pipeline</div>
          
          <div
            className={`arch-card agent orchestrator ${selectedAgent === "LangGraph Orchestrator" ? "active" : ""}`}
            onClick={() => setSelectedAgent("LangGraph Orchestrator")}
          >
            <FiLayers className="arch-icon" />
            <span>LangGraph Orchestrator</span>
          </div>

          <div className="agent-grid">
            {[
              "Intent Agent",
              "Sentiment Agent",
              "Customer Context Agent",
              "Knowledge Agent (RAG)",
              "Priority Agent",
              "Decision Agent",
            ].map((name) => (
              <div
                key={name}
                className={`arch-card agent ${selectedAgent === name ? "active" : ""}`}
                onClick={() => setSelectedAgent(name)}
              >
                <FiZap className="arch-icon" />
                <span>{name}</span>
              </div>
            ))}
          </div>

          {/* Conditional Branching */}
          <div className="arch-branch">
            <div
              className={`arch-card agent response ${selectedAgent === "Response Agent" ? "active" : ""}`}
              onClick={() => setSelectedAgent("Response Agent")}
            >
              <FiCheckCircle className="arch-icon" />
              <span>Response Agent</span>
            </div>
            <div
              className={`arch-card agent escalation ${selectedAgent === "Escalation Agent" ? "active" : ""}`}
              onClick={() => setSelectedAgent("Escalation Agent")}
            >
              <FiAlertTriangle className="arch-icon" />
              <span>Escalation Agent</span>
            </div>
          </div>
        </div>

        <div className="arch-arrow">↓</div>

        {/* Layer 4: Data Layer */}
        <div className="arch-layer horiz">
          <div className="arch-card data">
            <FiDatabase className="arch-icon" />
            <span>PostgreSQL (Customer / Ticket / History DB)</span>
          </div>
          <div className="arch-card data">
            <FiCpu className="arch-icon" />
            <span>ChromaDB Vector Store (RAG)</span>
          </div>
        </div>
      </div>

      {/* Selected Component Description Panel */}
      <div className="arch-inspector">
        <div className="inspector-title">
          <FiCpu /> <span>{selectedAgent}</span>
        </div>
        <div className="inspector-desc">{agentsInfo[selectedAgent]}</div>
      </div>
    </div>
  );
};

export default ArchitectureDiagram;
