import os
import re
import logging
from services.diagnostic_engine import get_engine, get_embedding, cosine_similarity

logger = logging.getLogger("code_therapist")

DOCS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "docs"))

class DocumentChunk:
    def __init__(self, source: str, tech: str, title: str, content: str):
        self.source = source
        self.tech = tech
        self.title = title
        self.content = content
        self.embedding = None

# Global store of document chunks
_chunks = []

def chunk_markdown_file(file_path: str) -> list[DocumentChunk]:
    """
    Reads a markdown file and splits it into chunks based on H2 headers (##).
    """
    chunks = []
    source = os.path.basename(file_path)
    tech = os.path.splitext(source)[0].lower()

    if not os.path.exists(file_path):
        return []

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Split content by H2 headers: '## Header Title'
        sections = re.split(r"\n##\s+", content)
        
        # The first section contains the main H1 title and introduction
        intro = sections[0].strip()
        intro_title = "Introduction"
        if intro.startswith("# "):
            lines = intro.split("\n")
            intro_title = lines[0].replace("# ", "").strip()
            intro = "\n".join(lines[1:]).strip()
        
        if intro:
            chunks.append(DocumentChunk(source, tech, intro_title, intro))

        for section in sections[1:]:
            parts = section.split("\n", 1)
            title = parts[0].strip()
            body = parts[1].strip() if len(parts) > 1 else ""
            if title and body:
                chunks.append(DocumentChunk(source, tech, title, body))

        logger.info(f"Loaded {len(chunks)} chunks from {source}")
    except Exception as e:
        logger.error(f"Failed to chunk file {file_path}: {e}")

    return chunks

def init_rag_store():
    """
    Initializes the RAG document store, loading and embedding all markdown files.
    """
    global _chunks
    _chunks = []

    if not os.path.exists(DOCS_DIR):
        logger.warning(f"RAG docs directory does not exist: {DOCS_DIR}")
        return

    logger.info("Initializing RAG document store...")
    
    # Load all markdown files
    for filename in os.listdir(DOCS_DIR):
        if filename.endswith(".md"):
            file_path = os.path.join(DOCS_DIR, filename)
            _chunks.extend(chunk_markdown_file(file_path))

    # Pre-compute embeddings
    engine = get_engine()
    if not engine.initialized:
        logger.warning("Diagnostic engine categories not initialized yet. Delaying RAG embeddings.")
        return

    count = 0
    for chunk in _chunks:
        try:
            # Embed both title and content for better match signals
            text_to_embed = f"{chunk.title}\n{chunk.content}"
            chunk.embedding = get_embedding(text_to_embed, task_type="retrieval_document")
            count += 1
        except Exception as e:
            logger.error(f"Failed to embed chunk '{chunk.title}' from {chunk.source}: {e}")

    logger.info(f"RAG Store initialized. Pre-computed embeddings for {count} chunks.")

def match_technology(tech_input: str) -> str:
    """
    Matches the user technology string against known RAG documentation files.
    """
    if not tech_input:
        return "generic"
        
    tech_input = tech_input.lower()
    
    # Simple mapping
    if "react" in tech_input or "nextjs" in tech_input or "next.js" in tech_input or "vite" in tech_input or "jsx" in tech_input:
        return "react"
    elif "fastapi" in tech_input or "api" in tech_input or "uvicorn" in tech_input:
        return "fastapi"
    elif "mongo" in tech_input or "pymongo" in tech_input or "nosql" in tech_input:
        return "mongodb"
    elif "python" in tech_input or "django" in tech_input or "flask" in tech_input:
        return "python"
    elif "javascript" in tech_input or "js" in tech_input or "node" in tech_input or "express" in tech_input or "typescript" in tech_input or "ts" in tech_input:
        return "javascript"
        
    return "generic"

def retrieve_relevant_docs(query_text: str, tech_input: str, limit: int = 2) -> list[dict]:
    """
    Search the in-memory RAG index for document chunks matching the technology and issue context.
    Returns a list of matching chunks with source reference and similarity score.
    """
    engine = get_engine()
    if not engine.initialized or not _chunks:
        return []

    target_tech = match_technology(tech_input)
    
    # Filter chunks: matches target technology or fallback general stacks
    filtered_chunks = [c for c in _chunks if c.tech == target_tech]
    
    # If no specific matches for this technology, search across all chunks
    if not filtered_chunks:
        filtered_chunks = _chunks

    if not filtered_chunks:
        return []

    try:
        # Encode query
        query_emb = get_embedding(query_text, task_type="retrieval_query")

        scored_chunks = []
        for chunk in filtered_chunks:
            if chunk.embedding is None:
                continue
            sim = cosine_similarity(query_emb, chunk.embedding)
            scored_chunks.append((chunk, float(sim)))

        # Sort by similarity descending
        scored_chunks.sort(key=lambda x: x[1], reverse=True)

        results = []
        for chunk, score in scored_chunks[:limit]:
            # Minimum similarity threshold of 0.20 to avoid completely irrelevant context injection
            if score >= 0.20:
                results.append({
                    "source": chunk.source,
                    "title": chunk.title,
                    "content": chunk.content,
                    "score": round(score, 4)
                })

        return results
    except Exception as e:
        logger.error(f"Error during RAG document retrieval: {e}", exc_info=True)
        return []
