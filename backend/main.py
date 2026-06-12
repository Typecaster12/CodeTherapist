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

from routes.diagnose import router as diagnose_router
from routes.sessions import router as sessions_router

app.include_router(diagnose_router)
app.include_router(sessions_router)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Code Therapist API is running"}


