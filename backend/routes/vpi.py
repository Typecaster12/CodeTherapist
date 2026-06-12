from fastapi import APIRouter, Depends
from pydantic import BaseModel
from services.vpi_service import scan_and_redact
from services.auth_service import get_current_user

router = APIRouter(tags=["vpi"])

class VPIScanRequest(BaseModel):
    error: str
    code: str

class VPIScanResponse(BaseModel):
    error_redacted: str
    code_redacted: str
    findings: list[dict]
    is_safe: bool

@router.post("/vpi/scan", response_model=VPIScanResponse)
def scan_payload(payload: VPIScanRequest, current_user: dict = Depends(get_current_user)):
    """
    Scans the provided error logs and code snippets for sensitive information.
    Requires authentication. Returns the redacted texts and detection logs.
    """
    error_redacted, error_findings = scan_and_redact(payload.error)
    code_redacted, code_findings = scan_and_redact(payload.code)

    # Combine findings and count unique occurrences
    combined_findings_map = {}
    for item in error_findings + code_findings:
        item_type = item["type"]
        if item_type not in combined_findings_map:
            combined_findings_map[item_type] = {
                "type": item_type,
                "count": 0,
                "severity": item["severity"]
            }
        combined_findings_map[item_type]["count"] += item["count"]

    findings = list(combined_findings_map.values())
    is_safe = len(findings) == 0

    return {
        "error_redacted": error_redacted,
        "code_redacted": code_redacted,
        "findings": findings,
        "is_safe": is_safe
    }
