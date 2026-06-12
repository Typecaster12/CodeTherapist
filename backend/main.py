import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.diagnostic_engine import init_engine

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("code_therapist")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up Code Therapist Backend...")
    try:
        init_engine()
        logger.info("Semantic Diagnostic Engine ready.")
    except Exception as e:
        logger.error(f"Failed to initialize Diagnostic Engine: {e}", exc_info=True)
    yield
    logger.info("Shutting down Code Therapist Backend...")

app = FastAPI(title="Code Therapist API", version="1.0.0", lifespan=lifespan)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:5174", "http://127.0.0.1:5174"
    ], # Frontend Dev URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from pydantic import BaseModel
from typing import Optional

class MockDiagnoseRequest(BaseModel):
    error: str
    code: str
    goal: str
    tech: str
    emotion: str
    timeStuck: int

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Code Therapist API is running"}

@app.post("/diagnose")
def mock_diagnose(payload: MockDiagnoseRequest):
    logger.info(f"Mocking diagnosis for: {payload.goal} stuck for {payload.timeStuck} mins")
    return {
        "category": "Syntax Error",
        "confidence": 0.85,
        "similarityMap": {
            "Syntax Error": 0.85,
            "Logic Error": 0.45,
            "Conceptual Gap": 0.35,
            "Architecture Issue": 0.20,
            "Tooling Problem": 0.15,
            "Debugging Skill Gap": 0.25,
            "Overengineering": 0.10,
            "Burnout": 0.05
        },
        "prescription": {
            "whyStuck": "You missed a colon at the end of your function definition on line 1.",
            "immediateStep": "Add the missing colon `:` at the end of your function definition, check indentation, and run again.",
            "studyNext": "Python basic function syntax and blocks structures.",
            "prevention": "Verify that your IDE or text editor has an active linter (like pylint or flake8) which alerts you of syntax issues before running."
        }
    }

