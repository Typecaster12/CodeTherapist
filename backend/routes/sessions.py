from fastapi import APIRouter, HTTPException, status, Depends
import logging
from services.session_service import get_all_sessions, get_learning_profile
from services.auth_service import get_current_user

logger = logging.getLogger("code_therapist")

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("")
def read_sessions(limit: int = 50, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    logger.info(f"GET /sessions user_id={user_id} limit={limit}")
    try:
        sessions = get_all_sessions(limit, user_id=user_id)
        return sessions
    except Exception as e:
        logger.error(f"Error fetching sessions: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve sessions: {str(e)}"
        )


@router.get("/profile")
def read_learning_profile(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    logger.info(f"GET /sessions/profile user_id={user_id}")
    try:
        profile = get_learning_profile(user_id=user_id)
        return profile
    except Exception as e:
        logger.error(f"Error compiling learning profile: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate learning profile: {str(e)}"
        )
