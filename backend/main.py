import os
import logging
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.diagnostic_engine import init_engine
from services.rag_service import init_rag_store

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("code_therapist")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up Code Therapist Backend...")
    
    # Run heavy initialization in background task to avoid Render port-binding timeouts
    async def init_task():
        try:
            logger.info("Background initialization of ML components started...")
            await asyncio.to_thread(init_engine)
            logger.info("Background Semantic Diagnostic Engine ready.")
            await asyncio.to_thread(init_rag_store)
            logger.info("Background RAG Document Store ready.")
        except Exception as e:
            logger.error(f"Failed to initialize Diagnostic Engine or RAG in background: {e}", exc_info=True)

    asyncio.create_task(init_task())
    yield
    logger.info("Shutting down Code Therapist Backend...")

app = FastAPI(title="Code Therapist API", version="1.0.0", lifespan=lifespan)


# Configure CORS
allowed_origins = [
    "http://localhost:5173", "http://127.0.0.1:5173",
    "http://localhost:5174", "http://127.0.0.1:5174",
    "http://localhost:5175", "http://127.0.0.1:5175",
    "http://localhost:5176", "http://127.0.0.1:5176",
    "http://localhost:5177", "http://127.0.0.1:5177",
    "http://localhost:5178", "http://127.0.0.1:5178",
    "http://localhost:5179", "http://127.0.0.1:5179",
    "http://localhost:5180", "http://127.0.0.1:5180",
]

env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    additional_origins = [origin.strip() for origin in env_origins.split(",") if origin.strip()]
    allowed_origins.extend(additional_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routes.diagnose import router as diagnose_router
from routes.sessions import router as sessions_router
from routes.auth import router as auth_router
from routes.vpi import router as vpi_router

app.include_router(auth_router)
app.include_router(diagnose_router)
app.include_router(sessions_router)
app.include_router(vpi_router)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Code Therapist API is running"}


