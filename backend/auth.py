"""Authentication helpers: JWT email/password + Emergent Google Auth."""
import os
import jwt
import bcrypt
import httpx
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Request, Depends
from typing import Optional
from models import User
from db import db

JWT_SECRET = os.environ.get("JWT_SECRET", "dev_secret")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_HOURS = int(os.environ.get("JWT_EXPIRE_HOURS", "168"))
EMERGENT_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_jwt(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_jwt(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except Exception:
        return None


async def fetch_emergent_session(session_id: str) -> dict:
    headers = {"X-Session-ID": session_id}
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(EMERGENT_SESSION_URL, headers=headers)
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session_id")
        return resp.json()


def _extract_token(request: Request) -> Optional[str]:
    token = request.cookies.get("session_token")
    if token:
        return token
    auth = request.headers.get("Authorization") or request.headers.get("authorization")
    if auth and auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1].strip()
    return None


async def get_current_user(request: Request) -> User:
    token = _extract_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    def _build(doc):
        d = {k: v for k, v in doc.items() if k not in ("_id", "password_hash", "gmail_app_password", "qes_credentials")}
        d["gmail_configured"] = bool(doc.get("gmail_user") and doc.get("gmail_app_password"))
        return User(**d)

    payload = decode_jwt(token)
    if payload and payload.get("user_id"):
        user_doc = await db.users.find_one({"user_id": payload["user_id"]}, {"_id": 0})
        if user_doc:
            return _build(user_doc)

    sess = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if sess:
        exp = sess.get("expires_at")
        if isinstance(exp, str):
            exp = datetime.fromisoformat(exp)
        if exp and exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp and exp >= datetime.now(timezone.utc):
            user_doc = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0})
            if user_doc:
                return _build(user_doc)

    raise HTTPException(status_code=401, detail="Invalid or expired session")
