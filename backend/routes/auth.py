import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Response, Request, status, Depends
from bson import ObjectId

from config.database import users_collection
from models.user import UserRegister, UserLogin, TokenResponse, UserOut
from services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
    REFRESH_TOKEN_EXPIRE_DAYS,
)

logger = logging.getLogger("code_therapist")
router = APIRouter(prefix="/auth", tags=["Auth"])

REFRESH_COOKIE = "ct_refresh_token"

# ── Helpers ────────────────────────────────────────────────────────────────────

def _user_to_out(user: dict) -> UserOut:
    return UserOut(
        id=str(user["_id"]),
        username=user["username"],
        email=user["email"],
    )


def _set_refresh_cookie(response: Response, token: str):
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=token,
        httponly=True,
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        secure=False,  # Set True in production with HTTPS
    )


# ── Fallback in-memory store when MongoDB is unavailable ──────────────────────
_fallback_users: list[dict] = []

def _find_user_by_email(email: str):
    if users_collection is not None:
        return users_collection.find_one({"email": email})
    return next((u for u in _fallback_users if u["email"] == email), None)

def _find_user_by_id(user_id: str):
    if users_collection is not None:
        try:
            return users_collection.find_one({"_id": ObjectId(user_id)})
        except Exception:
            return None
    return next((u for u in _fallback_users if str(u["_id"]) == user_id), None)

def _insert_user(doc: dict) -> str:
    if users_collection is not None:
        result = users_collection.insert_one(doc)
        return str(result.inserted_id)
    # Fallback: fake ObjectId-ish id
    import uuid
    fake_id = uuid.uuid4().hex
    doc["_id"] = fake_id
    _fallback_users.append(doc)
    return fake_id


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: UserRegister, response: Response):
    """Create a new user account."""
    # Check existing email
    if _find_user_by_email(body.email):
        raise HTTPException(status_code=409, detail="Email already registered.")

    # Check existing username
    if users_collection is not None:
        if users_collection.find_one({"username": body.username}):
            raise HTTPException(status_code=409, detail="Username already taken.")
    else:
        if any(u["username"] == body.username for u in _fallback_users):
            raise HTTPException(status_code=409, detail="Username already taken.")

    user_doc = {
        "username": body.username,
        "email": body.email,
        "hashed_password": hash_password(body.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    user_id = _insert_user(user_doc)

    token_payload = {"sub": user_id, "username": body.username, "email": body.email}
    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token(token_payload)
    _set_refresh_cookie(response, refresh_token)

    return TokenResponse(
        access_token=access_token,
        user=UserOut(id=user_id, username=body.username, email=body.email),
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: UserLogin, response: Response):
    """Authenticate and return tokens."""
    user = _find_user_by_email(body.email)
    if not user or not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    user_id = str(user["_id"])
    token_payload = {"sub": user_id, "username": user["username"], "email": user["email"]}
    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token(token_payload)
    _set_refresh_cookie(response, refresh_token)

    return TokenResponse(
        access_token=access_token,
        user=_user_to_out(user),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: Request, response: Response):
    """Use the httpOnly refresh cookie to get a new access token."""
    token = request.cookies.get(REFRESH_COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token provided.")

    payload = decode_token(token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type.")

    user_id = payload.get("sub")
    user = _find_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found.")

    token_payload = {"sub": user_id, "username": user["username"], "email": user["email"]}
    new_access = create_access_token(token_payload)
    new_refresh = create_refresh_token(token_payload)
    _set_refresh_cookie(response, new_refresh)

    return TokenResponse(
        access_token=new_access,
        user=_user_to_out(user),
    )


@router.post("/logout")
async def logout(response: Response):
    """Clear the refresh cookie."""
    response.delete_cookie(key=REFRESH_COOKIE, samesite="lax")
    return {"message": "Logged out successfully."}


@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Return the authenticated user's profile."""
    return _user_to_out(current_user)
