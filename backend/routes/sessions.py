from fastapi import APIRouter, HTTPException, status
import logging
from services.session_service import get_all_sessions, get_learning_profile

logger = logging.getLogger("code_therapist")

router = APIRouter(prefix="/sessions", tags=["sessions"])

@router.get("")
def read_sessions(limit: int = 50):
    logger.info(f"Received GET /sessions request with limit={limit}")
    try:
        sessions = get_all_sessions(limit)
        return sessions
    except Exception as e:
        logger.error(f"Error fetching sessions in route: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve sessions: {str(e)}"
        )

@router.get("/profile")
def read_learning_profile():
    logger.info("Received GET /sessions/profile request")
    try:
        profile = get_learning_profile()
        return profile
    except Exception as e:
        logger.error(f"Error compiling learning profile in route: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate learning profile: {str(e)}"
        )
