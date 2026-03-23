from beanie import Document, Indexed
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
from app.models.event_addons import EventAddOns


class EventCategory(str, Enum):
    CONCERT = "concert"
    SPORTS = "sports"
    CONFERENCE = "conference"
    THEATER = "theater"
    FESTIVAL = "festival"
    COMEDY = "comedy"
    WORKSHOP = "workshop"
    EXHIBITION = "exhibition"
    NETWORKING = "networking"
    SEMINAR = "seminar"
    FUNDRAISER = "fundraiser"
    OTHER = "other"


class EventStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    POSTPONED = "postponed"


class TicketTier(BaseModel):
    tier_id: str
    tier_name: str  # e.g., "VIP", "General Admission", "Early Bird"
    section_id: Optional[str] = None  # Reference to venue section
    price: float
    total_quantity: int
    available_quantity: int
    description: Optional[str] = None
    perks: List[str] = []  # e.g., ["Meet & Greet", "Free Parking"]

    # Dynamic pricing
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    current_price: float  # For AI dynamic pricing


class Event(Document):
    title: Indexed(str)
    slug: Indexed(str, unique=True)
    description: str

    # Organization & Venue
    organization_id: str
    venue_id: str

    # Category
    category: EventCategory
    tags: List[str] = []

    # DateTime
    start_datetime: datetime
    end_datetime: datetime
    doors_open: Optional[datetime] = None
    timezone: str = "UTC"

    # Tickets
    ticket_tiers: List[TicketTier] = []
    total_capacity: int
    total_sold: int = 0
    total_reserved: int = 0  # Temporary locks (in cart)

    # Pricing
    min_price: float
    max_price: float
    currency: str = "USD"

    # Media
    cover_image: Optional[str] = None
    banner_image: Optional[str] = None
    images: List[str] = []
    video_url: Optional[str] = None

    # Venue images (for AI analysis)
    venue_images: List[str] = []  # Images uploaded by organizer for AI to analyze

    # Artists/Performers
    performers: List[str] = []  # Names or IDs

    # ========== NEW: Event Add-ons ==========
    addons: Optional[EventAddOns] = None

    # Settings
    allow_waitlist: bool = True
    max_tickets_per_user: int = 10
    enable_dynamic_pricing: bool = False
    enable_blockchain_tickets: bool = False

    # Waitlist
    waitlist_count: int = 0

    # Status
    status: EventStatus = EventStatus.DRAFT
    is_featured: bool = False
    is_public: bool = True

    # SEO
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None

    # Analytics
    view_count: int = 0
    share_count: int = 0

    # ========== NEW: AI Creation Tracking ==========
    created_via_ai: bool = False  # Was this event created using AI chatbot?
    ai_conversation_id: Optional[str] = None  # Reference to AI conversation
    ai_suggestions_accepted: List[str] = []  # Which AI suggestions were used

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    published_at: Optional[datetime] = None

    class Settings:
        name = "events"
        indexes = [
            "organization_id",
            "venue_id",
            "slug",
            "category",
            "status",
            "start_datetime",
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Rock Festival 2026",
                "slug": "rock-festival-2026",
                "description": "Annual rock music festival",
                "organization_id": "org_id",
                "venue_id": "venue_id",
                "category": "concert",
                "start_datetime": "2026-06-15T18:00:00",
                "end_datetime": "2026-06-15T23:00:00",
                "total_capacity": 5000,
                "min_price": 50.0,
                "max_price": 200.0
            }
        }
