from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import jwt
from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash

from .config import settings


# OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# 現代化密碼雜湊工具（預設使用 argon2）
pwd_context = PasswordHash.recommended()  # 使用 argon2id（最安全的現代方案）


# -------------------------
# 密碼處理（pwdlib）
# -------------------------


def hash_password(password: str) -> str:
    """Hash a plain password with argon2id."""
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(password, hashed_password)


# -------------------------
# JWT Token（PyJWT）
# -------------------------


def create_access_token(
    data: dict[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token using PyJWT.
    """
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode["exp"] = expire

    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict[str, Any]]:
    """
    Decode a JWT access token.
    Returns the payload dict if valid, otherwise None.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except jwt.PyJWTError:
        return None
