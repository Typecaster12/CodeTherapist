import re
import logging

logger = logging.getLogger("code_therapist")

# Define regular expressions for sensitive entities
SENSITIVE_PATTERNS = {
    "MongoDB URI": (
        r"mongodb(?:\+srv)?://[a-zA-Z0-9._%+-]+:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+(?::\d+)?(?:/[a-zA-Z0-9._%+-]*)?"
    ),
    "Database Credentials (URL)": (
        r"(?:postgres|postgresql|mysql|sqlite)://[a-zA-Z0-9._%+-]+:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+(?::\d+)?(?:/[a-zA-Z0-9._%+-]*)?"
    ),
    "Google API Key": r"\bAIzaSy[A-Za-z0-9-_]{30,45}\b",
    "AWS Access Key ID": r"\bAKIA[0-9A-Z]{16}\b",
    "AWS Secret Access Key": r"\b[A-Za-z0-9+/]{40}\b",
    "GitHub Token": r"\bgh[oprs]_[A-Za-z0-9_]{36,255}\b",
    "Slack Webhook": r"https://hooks\.slack\.com/services/T[a-zA-Z0-9]+/B[a-zA-Z0-9]+/[a-zA-Z0-9]+",
    "Stripe API Key": r"\bsk_(?:live|test)_[0-9a-zA-Z]{24}\b",
    "Email Address": r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
    "IPv4 Address": r"\b(?:\d{1,3}\.){3}\d{1,3}\b",
    "Bearer Token": r"\bBearer\s+[A-Za-z0-9\-._~+/]+=*\b",
    "Generic Password Assignment": r"(?i)\b(?:password|passwd|secret|pass|secret_key|private_key|token)\s*=\s*['\"]([^'\"]+)['\"]"
}

def scan_and_redact(text: str) -> tuple[str, list[dict]]:
    """
    Scans input text for sensitive data (API keys, connection strings, emails, IPs).
    Replaces matches with desensitized tokens and returns the redacted text 
    along with a summary of findings.
    """
    if not text:
        return "", []

    redacted_text = text
    findings = []

    for name, pattern in SENSITIVE_PATTERNS.items():
        try:
            # For special patterns like generic password assignments where we only want to redact the capture group
            if name == "Generic Password Assignment":
                # Find all matches
                matches = re.findall(pattern, redacted_text)
                if matches:
                    unique_matches = list(set(matches))
                    count = len(unique_matches)
                    for m in unique_matches:
                        # Redact the specific password value in the text
                        redacted_text = redacted_text.replace(f"'{m}'", "'[REDACTED_PASSWORD]'")
                        redacted_text = redacted_text.replace(f'"{m}"', '"[REDACTED_PASSWORD]"')
                    findings.append({
                        "type": name,
                        "count": count,
                        "severity": "HIGH"
                    })
            else:
                matches = re.findall(pattern, redacted_text)
                if matches:
                    unique_matches = list(set(matches))
                    count = len(unique_matches)
                    for m in unique_matches:
                        redacted_text = redacted_text.replace(m, f"[REDACTED_{name.upper().replace(' ', '_').replace('(', '').replace(')', '')}]")
                    findings.append({
                        "type": name,
                        "count": count,
                        "severity": "CRITICAL" if "URI" in name or "Key" in name or "Token" in name or "Credential" in name else "MEDIUM"
                    })
        except Exception as e:
            logger.error(f"Error executing regex for pattern {name}: {e}")

    return redacted_text, findings
