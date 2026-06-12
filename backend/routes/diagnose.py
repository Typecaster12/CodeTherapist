from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
import logging
from services.diagnostic_engine import build_issue_text, classify_issue
from services.prescription_engine import generate_prescription
from services.session_service import save_session
from services.auth_service import get_current_user

logger = logging.getLogger("code_therapist")

router = APIRouter(tags=["diagnose"])

class DiagnoseRequest(BaseModel):
    error: str = Field(..., description="Error message or compiler exception log")
    code: str = Field(..., description="Code snippet block causing the issue")
    goal: str = Field(..., description="What the developer was trying to build")
    tech: str = Field(..., description="The technologies or frameworks used")
    emotion: str = Field(..., description="The emotional state of the developer")
    timeStuck: int = Field(..., description="Time spent stuck in minutes", ge=1)

@router.post("/diagnose")
def create_diagnosis(payload: DiagnoseRequest, current_user: dict = Depends(get_current_user)):
    logger.info(f"Received diagnose request for goal='{payload.goal}', tech='{payload.tech}'")
    try:
        # Build issue representation string
        issue_text = build_issue_text(payload.model_dump())
        
        # Run semantic classification
        diagnosis_result = classify_issue(issue_text)
        
        # Run Gemini prescription generator
        prescription_result = generate_prescription(
            issue_text=issue_text,
            category=diagnosis_result["category"],
            confidence=diagnosis_result["confidence"],
            emotion=payload.emotion,
            tech=payload.tech
        )
        
        # Save session to MongoDB
        session_data = {
            "user_id": str(current_user["_id"]),
            "error": payload.error,
            "code": payload.code,
            "goal": payload.goal,
            "technology": payload.tech,
            "emotion": payload.emotion,
            "timeStuck": payload.timeStuck,
            "diagnosedCategory": diagnosis_result["category"],
            "confidence": diagnosis_result["confidence"],
            "prescription": prescription_result
        }
        session_id = save_session(session_data)
        
        return {
            "sessionId": session_id,
            "category": diagnosis_result["category"],
            "confidence": diagnosis_result["confidence"],
            "similarityMap": diagnosis_result["similarityMap"],
            "issueText": issue_text,
            "prescription": prescription_result
        }
    except Exception as e:
        logger.error(f"Error during diagnosis processing: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Diagnostic Engine error: {str(e)}"
        )
