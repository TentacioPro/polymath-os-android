"""
User Model for Multi-User Authentication

Supports:
- Email-based registration and login
- Role-based access control (user, admin)
- Account lockout for brute force protection
- Refresh token management
"""

from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
import uuid
import re
import os

# Password policy from environment
PASSWORD_MIN_LENGTH = int(os.environ.get('PASSWORD_MIN_LENGTH', '12'))


class UserBase(BaseModel):
    """Base user fields shared across models."""
    email: EmailStr
    display_name: Optional[str] = Field(None, min_length=1, max_length=100)
    

class UserCreate(UserBase):
    """User registration request model."""
    password: str = Field(..., min_length=PASSWORD_MIN_LENGTH, max_length=128)
    
    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """
        Enforce password policy:
        - Minimum length (from env)
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one digit
        - At least one special character
        """
        if len(v) < PASSWORD_MIN_LENGTH:
            raise ValueError(f'Password must be at least {PASSWORD_MIN_LENGTH} characters')
        
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;\'`~]', v):
            raise ValueError('Password must contain at least one special character')
        
        return v


class UserUpdate(BaseModel):
    """User profile update request model."""
    display_name: Optional[str] = Field(None, min_length=1, max_length=100)
    current_password: Optional[str] = None
    new_password: Optional[str] = Field(None, min_length=PASSWORD_MIN_LENGTH, max_length=128)
    
    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v: Optional[str]) -> Optional[str]:
        """Apply password policy to new password if provided."""
        if v is None:
            return v
        
        if len(v) < PASSWORD_MIN_LENGTH:
            raise ValueError(f'Password must be at least {PASSWORD_MIN_LENGTH} characters')
        
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;\'`~]', v):
            raise ValueError('Password must contain at least one special character')
        
        return v


class User(UserBase):
    """User model for API responses (excludes sensitive fields)."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str = Field(default='user', pattern=r'^(user|admin)$')
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserInDB(User):
    """Internal user model with sensitive fields (for database storage)."""
    password_hash: str
    failed_login_attempts: int = 0
    lockout_until: Optional[datetime] = None
    
    def is_locked(self) -> bool:
        """Check if account is currently locked."""
        if self.lockout_until is None:
            return False
        return datetime.utcnow() < self.lockout_until
    
    def increment_failed_login(self) -> None:
        """Increment failed login counter."""
        self.failed_login_attempts += 1
    
    def reset_failed_login(self) -> None:
        """Reset failed login counter after successful login."""
        self.failed_login_attempts = 0
        self.lockout_until = None


class RefreshToken(BaseModel):
    """Refresh token for JWT token renewal."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    token_hash: str  # Store hashed token, not plaintext
    device_info: Optional[str] = None  # User agent or device identifier
    ip_address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    revoked: bool = False
    revoked_at: Optional[datetime] = None
    
    def is_valid(self) -> bool:
        """Check if token is still valid."""
        if self.revoked:
            return False
        return datetime.utcnow() < self.expires_at


class TokenPair(BaseModel):
    """JWT token pair response."""
    access_token: str
    refresh_token: str
    token_type: str = 'bearer'
    expires_in: int  # Access token expiry in seconds


class LoginRequest(BaseModel):
    """User login request."""
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    """Token refresh request."""
    refresh_token: str
