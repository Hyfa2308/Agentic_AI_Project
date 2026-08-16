# ASSISTIQ – Customer Sentiment & Escalation Agent

**AssistIQ** is an AI-powered customer support platform that processes customer messages, detects intent and emotional sentiment, retrieves relevant customer context & knowledge base information via RAG, evaluates ticket priority, and automatically decides whether to resolve the issue with an empathetic AI response or escalate it to a human support agent.

---

## 🌟 Architecture Overview

```
[Web Chat / Web Portal] ──> [FastAPI Backend] ──> [LangGraph Orchestrator]
                                                        │
         ┌───────────────────┬───────────────────┬──────┴────────────┐
         ▼                   ▼                   ▼                   ▼
    Intent Agent      Sentiment Agent     Context Agent       Knowledge Agent (RAG)
  (Refund, Payment...) (Angry, Frustrated) (PostgreSQL DB)    (ChromaDB + Vector Search)
         │                   │                   │                   │
         └───────────────────┴─────────┬─────────┴───────────────────┘
                                       ▼
                                 Priority Agent
                             (LOW/MEDIUM/HIGH/CRITICAL)
                                       │
                                       ▼
                                Decision Agent
                        (Auto-resolve vs. Escalate)
                                       │
                     ┌─────────────────┴─────────────────┐
                     ▼                                   ▼
             Response Agent                      Escalation Agent
           (Grounded AI Answer)              (Human Support Summary)
                     │                                   │
                     ▼                                   ▼
              Customer Reply                  Human Support Dashboard
```

---

## 🚀 Key Features

- **Multi-Agent Orchestration**: Modular LangGraph architecture coordinating 8 distinct AI agent nodes.
- **Real-Time Sentiment Analysis**: Emotion classification (`angry`, `frustrated`, `negative`, `positive`, `neutral`) with confidence scores.
- **RAG Knowledge Retrieval**: ChromaDB vector search indexing FAQs, SOPs, and company policies.
- **Smart Escalation & Business Rules**: Rule engine elevating angry or high-risk payment issues to human agents.
- **Human Support Dashboard**: Dedicated dashboard for agents to inspect AI reasoning, ticket summaries, recommended actions, and reply directly.
- **Customer Web Chat & Web Portal**: Interactive React chat and ticket creation portal.
- **Feedback & Analytics**: Customer rating loop for tracking AI resolution quality.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, JavaScript, Vanilla CSS (Custom Design System), Axios, React Icons, Vite
- **Backend**: Python 3.14, FastAPI, Uvicorn, Pydantic v2
- **AI / Agent Framework**: LangGraph, LangChain, OpenAI-compatible API
- **Databases**: PostgreSQL (with automatic local SQLite fallback), ChromaDB
- **Embeddings**: `BAAI/bge-small-en-v1.5` / ChromaDB default ONNX embeddings
- **Testing**: Pytest, FastAPI TestClient

---

## 📁 Repository Structure

```
AssistIQ/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entry point
│   │   ├── config/settings.py       # Configuration loaded from .env
│   │   ├── database/                # SQLAlchemy database models & session setup
│   │   │   ├── connection.py
│   │   │   └── init_db.py
│   │   ├── models/                  # Customer, Ticket, Message, Feedback models
│   │   ├── schemas/                 # Pydantic validation schemas
│   │   ├── routes/                  # Health, Chat, Ticket, Feedback API endpoints
│   │   ├── agents/                  # LangGraph agents & State definition
│   │   │   ├── state.py
│   │   │   ├── intent_agent.py
│   │   │   ├── sentiment_agent.py
│   │   │   ├── context_agent.py
│   │   │   ├── knowledge_agent.py
│   │   │   ├── priority_agent.py
│   │   │   ├── decision_agent.py
│   │   │   ├── response_agent.py
│   │   │   ├── escalation_agent.py
│   │   │   └── orchestrator.py      # Main workflow graph builder
│   │   ├── services/                # LLM service, RAG service, Business Rules
│   │   └── middleware/              # Request ID & timing logger
│   ├── knowledge_base/              # Markdown documents (faqs/, sops/, policies/)
│   ├── scripts/ingest_knowledge.py  # ChromaDB indexing script
│   ├── tests/                       # Pytest test suite
│   ├── .env.example
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── pages/                   # Home, WebChat, WebPortal, Dashboard
    │   ├── components/              # Navbar & shared UI widgets
    │   ├── services/api.js          # Axios API client
    │   └── styles/                  # CSS design system & page stylesheets
    ├── index.html
    └── package.json
```

---

## ⚡ Quickstart Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- (Optional) PostgreSQL database instance

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Optional: Set OPENAI_API_KEY in .env if using OpenAI

# Ingest knowledge documents into ChromaDB
python -m scripts.ingest_knowledge

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
Backend will start at: `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend will start at: `http://localhost:5173`.

---

## 🧪 Running Tests

Run the complete test suite covering API endpoints, agent nodes, business rules, and 4 customer scenarios:

```bash
cd backend
venv/bin/pytest tests/ -v
```

---

## 📊 API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check endpoint |
| `POST` | `/api/chat` | Main AI chat endpoint (runs LangGraph workflow) |
| `POST` | `/api/tickets` | Create a support ticket from Web Portal |
| `GET` | `/api/tickets` | List tickets (with status/priority/escalated filters) |
| `GET` | `/api/tickets/{ticket_id}` | Retrieve ticket details & message thread |
| `PATCH` | `/api/tickets/{ticket_id}` | Update ticket status, priority, or human notes |
| `POST` | `/api/tickets/{ticket_id}/messages` | Add human support or customer reply to ticket |
| `POST` | `/api/feedback` | Submit customer rating and feedback |

---

## 🎯 Verified Customer Scenarios

1. **FAQ Query ("What is your refund policy?")**  
   → Detected Intent: `refund`, Sentiment: `neutral`.  
   → Knowledge Agent retrieves 30-day money-back policy from ChromaDB.  
   → Decision: Auto-resolve with grounded AI answer.

2. **Frustrated Payment Issue ("I'm frustrated! My payment failed again!")**  
   → Detected Intent: `payment_issue`, Sentiment: `frustrated`.  
   → Business Rules elevate priority to `HIGH`.

3. **Angry Escalation ("This is UNACCEPTABLE! Fix my billing or I will call my lawyer!")**  
   → Detected Sentiment: `angry`, Priority: `CRITICAL`.  
   → Decision: Auto-escalate.  
   → Escalation Agent creates ticket `TKT-XXXXXXXX`, generates summary & recommended agent action, and sends ticket to Human Support Dashboard.

4. **Unknown Query ("Help with quantum computing")**  
   → Safe fallback response generated; no hallucinated policies.
