"""
RAG Service using ChromaDB for knowledge base vector store indexing and query retrieval.
"""

import os
import glob
import logging
from typing import List, Dict, Any

from app.config.settings import settings

logger = logging.getLogger("assistiq")


class RAGService:
    """ChromaDB RAG vector search service."""

    def __init__(self):
        self.persist_dir = settings.CHROMA_PERSIST_DIR
        self.collection_name = settings.CHROMA_COLLECTION_NAME
        self.chroma_client = None
        self.collection = None

        self._init_chroma()

    def _init_chroma(self):
        """Initialize ChromaDB persistent client and collection."""
        try:
            import chromadb
            from chromadb.config import Settings as ChromaSettings

            os.makedirs(self.persist_dir, exist_ok=True)
            self.chroma_client = chromadb.PersistentClient(path=self.persist_dir)
            self.collection = self.chroma_client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"},
            )
            logger.info("ChromaDB initialized at %s with collection '%s'", self.persist_dir, self.collection_name)
        except Exception as e:
            logger.warning("ChromaDB initialization warning: %s. RAG using local document search.", e)

    def query(self, query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Query knowledge vector store for relevant chunks."""
        results = []

        if self.collection is not None and self.collection.count() > 0:
            try:
                res = self.collection.query(
                    query_texts=[query_text],
                    n_results=top_k,
                )
                if res and res.get("documents") and res["documents"][0]:
                    docs = res["documents"][0]
                    metas = res["metadatas"][0] if res.get("metadatas") else [{}] * len(docs)
                    distances = res["distances"][0] if res.get("distances") else [0.0] * len(docs)

                    for doc, meta, dist in zip(docs, metas, distances):
                        results.append({
                            "content": doc,
                            "source": meta.get("source", "knowledge_base"),
                            "score": round(1.0 - float(dist), 3) if dist else 0.90,
                        })
                    return results
            except Exception as e:
                logger.error("ChromaDB query error: %s", e)

        # Local fallback document search if ChromaDB is empty or unpopulated
        return self._fallback_local_search(query_text, top_k)

    def _fallback_local_search(self, query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Keyword matching fallback across local knowledge_base files."""
        kb_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "knowledge_base")
        files = glob.glob(os.path.join(kb_path, "**", "*.md"), recursive=True)

        query_terms = [t.lower() for t in query_text.split() if len(t) > 3]
        matches = []

        for filepath in files:
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()

                sections = content.split("## ")
                for sec in sections:
                    if not sec.strip():
                        continue
                    sec_text = "## " + sec if not sec.startswith("#") else sec
                    lower_sec = sec_text.lower()

                    match_count = sum(1 for term in query_terms if term in lower_sec)
                    if match_count > 0:
                        matches.append({
                            "content": sec_text.strip(),
                            "source": os.path.basename(filepath),
                            "score": min(0.95, 0.5 + (match_count * 0.15)),
                        })
            except Exception as e:
                logger.warning("Error reading file %s: %s", filepath, e)

        matches.sort(key=lambda x: x["score"], reverse=True)
        return matches[:top_k]


rag_service = RAGService()
