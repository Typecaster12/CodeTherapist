import logging
from sentence_transformers import SentenceTransformer, util

logger = logging.getLogger("code_therapist")

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

class DiagnosticEngine:
    def __init__(self):
        self.model = None
        self.category_embeddings = {}

    def load_model(self):
        if self.model is None:
            logger.info("Loading SentenceTransformer model 'all-MiniLM-L6-v2'...")
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Model loaded successfully. Pre-computing category embeddings...")
            
            # Compute embeddings for all categories
            for cat, desc in CATEGORIES.items():
                self.category_embeddings[cat] = self.model.encode(desc, convert_to_tensor=True)
            logger.info("Category embeddings cached successfully.")

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
    # Place critical technical signals first to avoid model token truncation (max 256 tokens)
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
    if engine.model is None:
        raise RuntimeError("Diagnostic engine model is not loaded. Call init_engine() first.")

    # Encode issue
    issue_emb = engine.model.encode(issue_text, convert_to_tensor=True)

    # Compute similarities
    similarity_map = {}
    for cat, cat_emb in engine.category_embeddings.items():
        sim = util.cos_sim(issue_emb, cat_emb).item()
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
