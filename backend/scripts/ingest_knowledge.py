"""
Knowledge base ingestion script.
Reads documents from knowledge_base/, splits them into chunks, and stores embeddings in ChromaDB.
"""

import os
import glob
import logging
from app.config.settings import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ingest")


def chunk_markdown(content: str, max_chunk_size: int = 500) -> list[str]:
    """Splits markdown file content into logical sections or chunks."""
    sections = content.split("## ")
    chunks = []
    for sec in sections:
        sec = sec.strip()
        if not sec:
            continue
        header_text = "## " + sec if not sec.startswith("#") else sec
        if len(header_text) > max_chunk_size:
            paragraphs = header_text.split("\n\n")
            chunks.extend([p.strip() for p in paragraphs if p.strip()])
        else:
            chunks.append(header_text)
    return chunks


def ingest_knowledge():
    """Ingests all files from knowledge_base directory into ChromaDB."""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    kb_dir = os.path.join(base_dir, "knowledge_base")

    logger.info("Scanning knowledge base at: %s", kb_dir)
    md_files = glob.glob(os.path.join(kb_dir, "**", "*.md"), recursive=True)

    if not md_files:
        logger.warning("No markdown files found in %s", kb_dir)
        return

    documents = []
    metadatas = []
    ids = []

    doc_counter = 0
    for filepath in md_files:
        rel_path = os.path.relpath(filepath, kb_dir)
        logger.info("Processing document: %s", rel_path)

        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        chunks = chunk_markdown(content)
        for idx, chunk in enumerate(chunks):
            doc_counter += 1
            doc_id = f"doc_{doc_counter}_{idx}"
            documents.append(chunk)
            metadatas.append({
                "source": os.path.basename(filepath),
                "filepath": rel_path,
                "chunk_index": idx,
            })
            ids.append(doc_id)

    logger.info("Total chunks generated: %d", len(documents))

    try:
        import chromadb

        persist_dir = settings.CHROMA_PERSIST_DIR
        client = chromadb.PersistentClient(path=persist_dir)
        collection = client.get_or_create_collection(
            name=settings.CHROMA_COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )

        # Clear existing
        try:
            existing_ids = collection.get().get("ids", [])
            if existing_ids:
                collection.delete(ids=existing_ids)
        except Exception as e:
            logger.debug("Clear collection notice: %s", e)

        # Add new chunks
        collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids,
        )
        logger.info("Ingestion completed successfully into ChromaDB at %s!", persist_dir)
    except BaseException as e:
        logger.warning("ChromaDB ingestion warning: %s. Local markdown search fallback remains active.", e)


if __name__ == "__main__":
    ingest_knowledge()
