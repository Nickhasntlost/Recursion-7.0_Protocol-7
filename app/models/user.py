from beanie import Document, Indexed
from pydantic import EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    USER = "user"
    ORGANIZER = "organizer"
    ADMIN = "admin"


class User(Document):
    email: Indexed(EmailStr, unique=True)
    username: Indexed(str, unique=True)
    full_name: str
    hashed_password: str
    phone: Optional[str] = None
    role: UserRole = UserRole.USER

    # Profile
    avatar_url: Optional[str] = None
    bio: Optional[str] = None

    # Location
    city: Optional[str] = None
    country: Optional[str] = None

    # Organization reference (if user is an organizer)
    organization_id: Optional[str] = None

    # Gamification
    loyalty_points: int = 0
    total_bookings: int = 0
    badges: list[str] = []

    # Account status
    is_active: bool = True
    is_verified: bool = False
    is_email_verified: bool = False

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

    class Settings:
        name = "users"
        indexes = [
            "email",
            "username",
            "organization_id",
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "username": "johndoe",
                "full_name": "John Doe",
                "phone": "+1234567890",
                "role": "user",
                "city": "New York",
                "country": "USA"
            }
        }
