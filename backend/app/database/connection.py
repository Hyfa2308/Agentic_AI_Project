"""
Database connection and session management.
Supports PostgreSQL (default) with automatic fallback to SQLite for local development.
"""

import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config.settings import settings

logger = logging.getLogger("assistiq")

Base = declarative_base()

database_url = settings.DATABASE_URL

# For SQLite compatibility with multithreading
connect_args = {}
if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(database_url, connect_args=connect_args, pool_pre_ping=True)
    # Test connection
    with engine.connect() as conn:
        pass
    logger.info("Connected to database at %s", database_url.split("@")[-1] if "@" in database_url else database_url)
except Exception as e:
    logger.warning("Could not connect to primary DB (%s): %s. Falling back to local SQLite.", database_url, e)
    fallback_url = "sqlite:///./assistiq.db"
    engine = create_engine(fallback_url, connect_args={"check_same_thread": False})
    logger.info("Connected to fallback SQLite database at %s", fallback_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency for obtaining database session in FastAPI routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
