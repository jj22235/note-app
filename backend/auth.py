import hashlib
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

import models
from database import get_db

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))

security = HTTPBearer(auto_error=False)


def _password_key(password: str) -> bytes:
    """bcrypt 仅处理最多 72 字节；先 SHA256 再 bcrypt，避免超长 UTF-8 与 passlib/bcrypt4 兼容问题。"""
    return hashlib.sha256(password.encode("utf-8")).digest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            _password_key(plain_password),
            hashed_password.encode("utf-8"),
        )
    except (ValueError, TypeError):
        return False


def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(_password_key(password), salt).decode("utf-8")


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": str(user_id), "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_user_id(token: str) -> int:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise HTTPException(status_code=401, detail="无效令牌")
        return int(sub)
    except (JWTError, ValueError, TypeError):
        raise HTTPException(status_code=401, detail="无效或过期的令牌")


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> models.User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="未登录或令牌缺失")
    user_id = decode_user_id(credentials.credentials)
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="用户不存在")
    return user
