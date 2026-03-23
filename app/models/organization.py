from beanie import Document, Indexed
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class SocialLinks(BaseModel):
    website: Optional[str] = None
    facebook: Optional[str] = None
    twitter: Optional[str] = None
    instagram: Optional[str] = None
    linkedin: Optional[str] = None


class Organization(Document):
    name: Indexed(str, unique=True)
    email: EmailStr
    description: Optional[str] = None

    # Contact Info
    phone: Optional[str] = None
    address: Optional[str] = None
    city: str
    country: str
    postal_code: Optional[str] = None

    # Media
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    social_links: Optional[SocialLinks] = None

    # Owner/Admin
    owner_id: str  # Reference to User document
    admin_ids: List[str] = []  # Multiple admins can manage

    # Verification
    is_verified: bool = False
    verification_documents: List[str] = []  # URLs to verification docs

    # Business Info
    business_registration_number: Optional[str] = None
    tax_id: Optional[str] = None

    # Statistics
    total_events: int = 0
    total_revenue: float = 0.0
    total_tickets_sold: int = 0

    # Account status
    is_active: bool = True
    subscription_tier: str = "free"  # free, basic, premium, enterprise

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "organizations"
        indexes = [
            "name",
            "owner_id",
            "city",
            "is_verified",
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Event Masters Inc",
                "email": "info@eventmasters.com",
                "description": "Leading event management company",
                "phone": "+1234567890",
                "city": "Los Angeles",
                "country": "USA",
                "owner_id": "user_id_here"
            }
        }
