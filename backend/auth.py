"""
JWT Authentication System for Polymath OS

Features:
- Access + refresh token flow
- Argon2id password hashing
- Token rotation on refresh
- Device tracking and session management
- Account lockout protection
"""

from datetime import datetime, timedelta
from typing import Optional, Tuple
import os
import secrets
import hashlib
import logging

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from models.user import User, UserInDB, RefreshToken, TokenPair

logger = logging.getLogger(__name__)

# JWT Configuration from environment
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRE_MINUTES', '30'))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.environ.get('JWT_REFRESH_TOKEN_EXPIRE_DAYS', '7'))

# Account lockout configuration
ACCOUNT_LOCKOUT_THRESHOLD = int(os.environ.get('ACCOUNT_LOCKOUT_THRESHOLD', '5'))
ACCOUNT_LOCKOUT_DURATION_MINUTES = int(os.environ.get('ACCOUNT_LOCKOUT_DURATION_MINUTES', '30'))

# Password hashing context - Argon2id is the recommended algorithm
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
    argon2__time_cost=2,
    argon2__memory_cost=65536,  # 64 MB
    argon2__parallelism=4,
)

# HTTP Bearer token security scheme
security = HTTPBearer(auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False


def hash_password(password: str) -> str:
    """Hash a password using Argon2id."""
    return pwd_context.hash(password)


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Payload data (should include 'sub' with user ID)
        expires_delta: Custom expiration time
        
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })
    
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def create_refresh_token() -> Tuple[str, str]:
    """
    Create a secure refresh token.
    
    Returns:
        Tuple of (raw_token, token_hash) - store hash, return raw to client
    """
    raw_token = secrets.token_urlsafe(64)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    return raw_token, token_hash


def verify_refresh_token(raw_token: str, stored_hash: str) -> bool:
    """Verify a refresh token against its stored hash."""
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    return secrets.compare_digest(token_hash, stored_hash)


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decode and validate a JWT access token.
    
    Args:
        token: The JWT token string
        
    Returns:
        Decoded payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        
        # Verify token type
        if payload.get("type") != "access":
            logger.warning("Token type mismatch - expected access token")
            return None
        
        return payload
    except JWTError as e:
        logger.debug(f"JWT decode error: {e}")
        return None


def create_token_pair(user_id: str, user_email: str) -> Tuple[str, str, str, datetime]:
    """
    Create an access/refresh token pair.
    
    Args:
        user_id: User's unique ID
        user_email: User's email for token payload
        
    Returns:
        Tuple of (access_token, refresh_token, refresh_token_hash, refresh_expires_at)
    """
    # Create access token
    access_token = create_access_token(
        data={"sub": user_id, "email": user_email}
    )
    
    # Create refresh token
    refresh_token, refresh_hash = create_refresh_token()
    refresh_expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    return access_token, refresh_token, refresh_hash, refresh_expires_at


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db = None  # Injected by the route
) -> Optional[User]:
    """
    FastAPI dependency to get the current authenticated user.
    
    Usage:
        @app.get("/protected")
        async def protected_route(user: User = Depends(get_current_user)):
            return {"user": user.email}
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {"id": user_id, "email": payload.get("email")}


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[dict]:
    """
    Get current user if authenticated, None otherwise.
    Useful for routes that work for both authenticated and anonymous users.
    """
    if credentials is None:
        return None
    
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        return None
    
    return {"id": payload.get("sub"), "email": payload.get("email")}


def check_account_lockout(user: UserInDB) -> None:
    """
    Check if an account is locked and raise exception if so.
    
    Args:
        user: The user to check
        
    Raises:
        HTTPException: If account is locked
    """
    if user.lockout_until and datetime.utcnow() < user.lockout_until:
        remaining = (user.lockout_until - datetime.utcnow()).total_seconds()
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail=f"Account locked. Try again in {int(remaining / 60)} minutes."
        )


def should_lock_account(failed_attempts: int) -> bool:
    """Check if account should be locked based on failed attempts."""
    return failed_attempts >= ACCOUNT_LOCKOUT_THRESHOLD


def get_lockout_until() -> datetime:
    """Calculate lockout expiration time."""
    return datetime.utcnow() + timedelta(minutes=ACCOUNT_LOCKOUT_DURATION_MINUTES)


def get_client_info(request: Request) -> Tuple[str, str]:
    """
    Extract client information from request for audit logging.
    
    Returns:
        Tuple of (ip_address, user_agent)
    """
    ip_address = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    
    # Handle X-Forwarded-For for proxied requests
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        ip_address = forwarded_for.split(",")[0].strip()
    
    return ip_address, user_agent
