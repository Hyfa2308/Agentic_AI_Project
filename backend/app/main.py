"""
AssistIQ – FastAPI Application Entry Point

AI-Powered Customer Sentiment & Escalation Platform.
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.middleware.request_logging import RequestLoggingMiddleware
from app.routes import health, chat, tickets, feedback, customers, conversations, knowledge
from app.database.init_db import init_db

# ── Logging ──────────────────────────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL, logging.INFO),
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("assistiq")

# Initialize DB tables & seed data on app start
init_db()

# ── FastAPI App ──────────────────────────────────────────────────────
app = FastAPI(
    title="AssistIQ API",
    description="AI-Powered Customer Sentiment & Escalation Platform",
    version="1.0.0",
)

# ── Middleware ────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)

# ── Routes ───────────────────────────────────────────────────────────
app.include_router(health.router, prefix="/api")
app.include_router(chat.router)
app.include_router(tickets.router)
app.include_router(feedback.router)
app.include_router(customers.router)
app.include_router(conversations.router)
app.include_router(knowledge.router)


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "service": "AssistIQ API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
    }


logger.info("AssistIQ API initialized (env=%s, ai_mode=%s)", settings.APP_ENV, settings.AI_MODE)
