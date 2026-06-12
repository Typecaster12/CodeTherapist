import os
import math
import logging
from dotenv import load_dotenv
import google.generativeai as genai

logger = logging.getLogger("code_therapist")

# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

CATEGORIES = {
    "Syntax Error": (
        "Syntax error, code typos, missing parenthese, missing bracket, missing brace, indentation error, "
        "unexpected indent, unclosed quote, spelling mistakes in syntax keywords, SyntaxError, unexpected token, "
        "compilation failed, invalid syntax, parsing errors."
    ),
    "Logic Error": (
        "Logic error, flawed algorithm logic, code runs but output is wrong, infinite loop, off by one error, "
        "incorrect conditional check, index out of range, variable scoping bug, state mutation bug, "
        "wrong calculation results, incorrect output, behavioral bugs."
    ),
    "Conceptual Gap": (
        "Conceptual understanding gap, framework lifecycle misunderstanding, React state batching, "
        "asynchronous Javascript execution order, pointer reference vs value confusion, API design misunderstanding, "
        "SQL join confusion, not knowing how the technology works under the hood, how library behaves."
    ),
    "Architecture Issue": (
        "Architecture design flaw, spaghetti code, tight coupling, separation of concerns violated, "
        "global variable abuse, duplicate code, circular imports, codebase scalability issues, "
        "difficult to refactor structural organization, circular dependencies."
    ),
    "Tooling Problem": (
        "Tooling problem, dependency installation failed, ModuleNotFoundError, ImportError, package version conflict, "
        "npm install error, pip install error, bun add fail, vite build config error, virtualenv setup error, "
        "port already in use, missing local environment variable, docker container fail, package mismatch."
    ),
    "Debugging Skill Gap": (
        "Debugging habit gap, lacking structured isolation strategy, blindly editing code without verifying, "
        "not writing prints or logger statements, not checking the stack trace source line, not using debuggers, "
        "ignoring terminal warnings, blind trial and error."
    ),
    "Overengineering": (
        "Overengineering, premature optimization, too many interfaces for a simple task, writing redundant abstractions, "
        "YAGNI violation, adding unneeded design patterns for simple CRUD, adding features that are not requested."
    ),
    "Burnout": (
        "Developer burnout, mental fatigue, exhaustion, feeling overwhelmed, extreme frustration, anxiety, stress, "
        "spent hours stuck on a simple problem, feeling stuck and hopeless, brain fog, tiredness, mental block."
    )
}

def get_embedding(text: str, task_type: str = "retrieval_document") -> list[float]:
    """
    Generates a lightweight vector embedding using Gemini API's gemini-embedding-2 model.
    """
    if not api_key:
        logger.warning("GEMINI_API_KEY environment variable is missing. Cannot fetch real embeddings.")
        return [0.0] * 3072
    try:
        response = genai.embed_content(
            model="models/gemini-embedding-2",
            content=text,
            task_type=task_type
        )
        return response['embedding']
    except Exception as e:
        logger.error(f"Error generating embedding via Gemini API: {e}")
        return [0.0] * 3072

def cosine_similarity(v1: list[float], v2: list[float]) -> float:
    """
    Computes cosine similarity between two lists of floats in pure Python.
    """
    dot_product = sum(a * b for a, b in zip(v1, v2))
    norm_v1 = math.sqrt(sum(a * a for a in v1))
    norm_v2 = math.sqrt(sum(a * a for a in v2))
    if norm_v1 == 0.0 or norm_v2 == 0.0:
        return 0.0
    return dot_product / (norm_v1 * norm_v2)

class DiagnosticEngine:
    def __init__(self):
        self.initialized = False
        self.category_embeddings = {}

    def load_model(self):
        if not self.initialized:
            logger.info("Initializing DiagnosticEngine categories using Gemini Embeddings...")
            # Compute embeddings for all categories
            for cat, desc in CATEGORIES.items():
                self.category_embeddings[cat] = get_embedding(desc, task_type="retrieval_document")
            self.initialized = True
            logger.info("Category embeddings cached successfully using Gemini text-embedding-004.")

# Global engine instance
_engine = DiagnosticEngine()

def init_engine():
    _engine.load_model()

def get_engine() -> DiagnosticEngine:
    return _engine

def build_issue_text(payload: dict) -> str:
    """
    Combines form fields into a structured string for embedding, prioritizing technical context.
    """
    error = payload.get("error", "").strip()
    code = payload.get("code", "").strip()
    goal = payload.get("goal", "").strip()
    tech = payload.get("tech", "").strip()
    emotion = payload.get("emotion", "").strip()
    time_stuck = payload.get("timeStuck", 0)

    parts = []
    # Place critical technical signals first to avoid model token truncation
    if error:
        parts.append(f"Error Message:\n{error}")
    if code:
        parts.append(f"Code Snippet:\n{code}")
    if goal:
        parts.append(f"Goal: {goal}")
    if tech:
        parts.append(f"Technology: {tech}")
    if emotion:
        parts.append(f"Emotional State: {emotion}")
    if time_stuck:
        parts.append(f"Time Spent Stuck: {time_stuck} minutes")

    return "\n\n".join(parts)


def classify_issue(issue_text: str) -> dict:
    """
    Encodes the issue text and computes similarity against cached categories.
    """
    engine = get_engine()
    if not engine.initialized:
        raise RuntimeError("Diagnostic engine is not initialized. Call init_engine() first.")

    # Encode issue
    issue_emb = get_embedding(issue_text, task_type="retrieval_query")

    # Compute similarities
    similarity_map = {}
    for cat, cat_emb in engine.category_embeddings.items():
        sim = cosine_similarity(issue_emb, cat_emb)
        # Ensure similarity score is a clean float in range [0, 1]
        similarity_map[cat] = round(max(0.0, float(sim)), 4)

    # Find the top category
    sorted_scores = sorted(similarity_map.items(), key=lambda x: x[1], reverse=True)
    top_cat, confidence = sorted_scores[0]

    return {
        "category": top_cat,
        "confidence": confidence,
        "similarityMap": similarity_map
    }
