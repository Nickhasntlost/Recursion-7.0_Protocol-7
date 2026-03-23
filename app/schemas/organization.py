from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class SocialLinksSchema(BaseModel):
    website: Optional[str] = None
    facebook: Optional[str] = None
    twitter: Optional[str] = None
    instagram: Optional[str] = None
    linkedin: Optional[str] = None


class OrganizationCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    description: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: str
    country: str
    postal_code: Optional[str] = None
    social_links: Optional[SocialLinksSchema] = None


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    social_links: Optional[SocialLinksSchema] = None


class OrganizationResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    description: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: str
    country: str
    postal_code: Optional[str] = None
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    social_links: Optional[SocialLinksSchema] = None
    owner_id: str
    admin_ids: List[str] = []
    is_verified: bool
    total_events: int
    is_active: bool
    created_at: datetime
