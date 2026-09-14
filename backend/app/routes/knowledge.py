"""
Knowledge Base API endpoints for listing documents and uploading/indexing new knowledge articles into ChromaDB.
"""

import os
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.knowledge import KnowledgeDocument
from app.services.rag_service import rag_service

logger = logging.getLogger("assistiq")
router = APIRouter(prefix="/api", tags=["Knowledge"])


class KnowledgeDocSchema(BaseModel):
    id: Optional[int] = None
    title: str
    category: str
    content: str
    filepath: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class KnowledgeListResponse(BaseModel):
    documents: List[KnowledgeDocSchema]
    total: int


@router.get("/knowledge", response_model=KnowledgeListResponse)
def list_knowledge_documents(db: Session = Depends(get_db)):
    """List all knowledge base documents stored in database."""
    docs = db.query(KnowledgeDocument).order_by(KnowledgeDocument.created_at.desc()).all()
    return KnowledgeListResponse(
        documents=[
            KnowledgeDocSchema(
                id=d.id,
                title=d.title,
                category=d.category,
                content=d.content,
                filepath=d.filepath,
                created_at=d.created_at.isoformat() if d.created_at else None,
            )
            for d in docs
        ],
        total=len(docs),
    )


@router.post("/knowledge", response_model=KnowledgeDocSchema, status_code=status.HTTP_201_CREATED)
def create_knowledge_document(doc: KnowledgeDocSchema, db: Session = Depends(get_db)):
    """Create a new knowledge base article."""
    db_doc = KnowledgeDocument(
        title=doc.title,
        category=doc.category or "general",
        content=doc.content,
        filepath=doc.filepath,
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    logger.info("Created Knowledge Document: %s (%s)", db_doc.title, db_doc.category)
    return doc


@router.post("/knowledge/upload", status_code=status.HTTP_201_CREATED)
async def upload_knowledge_file(
    file: UploadFile = File(...),
    category: str = Form("general"),
    db: Session = Depends(get_db),
):
    """Upload a markdown document to the knowledge base directory."""
    if not file.filename.endswith((".md", ".txt")):
        raise HTTPException(status_code=400, detail="Only .md or .txt files are allowed.")

    kb_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "knowledge_base", category)
    os.makedirs(kb_dir, exist_ok=True)
    filepath = os.path.join(kb_dir, file.filename)

    content_bytes = await file.read()
    content_str = content_bytes.decode("utf-8")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content_str)

    db_doc = KnowledgeDocument(
        title=file.filename.replace(".md", "").replace("_", " ").title(),
        category=category,
        content=content_str,
        filepath=filepath,
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)

    logger.info("Uploaded knowledge document %s to %s", file.filename, filepath)
    return {"message": f"Document '{file.filename}' uploaded and saved successfully.", "id": db_doc.id}
