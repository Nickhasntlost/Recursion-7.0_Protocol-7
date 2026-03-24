from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.event import EventCategory, EventStatus, TicketTier


class EventCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str
    venue_id: str
    category: EventCategory
    tags: List[str] = []
    start_datetime: datetime
    end_datetime: datetime
    doors_open: Optional[datetime] = None
    ticket_tiers: List[TicketTier]
    cover_image: Optional[str] = None
    performers: List[str] = []
    allow_waitlist: bool = True
    max_tickets_per_user: int = 10
    enable_dynamic_pricing: bool = False


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    doors_open: Optional[datetime] = None
    cover_image: Optional[str] = None
    banner_image: Optional[str] = None
    status: Optional[EventStatus] = None
    is_featured: Optional[bool] = None


class EventResponse(BaseModel):
    id: str
    title: str
    slug: str
    description: str
    organization_id: Optional[str] = None  # None for platform events
    venue_id: str
    category: EventCategory
    tags: List[str]
    start_datetime: datetime
    end_datetime: datetime
    ticket_tiers: List[TicketTier]
    total_capacity: int
    total_sold: int
    total_reserved: int = 0
    min_price: float
    max_price: float
    currency: str
    cover_image: Optional[str]
    performers: List[str]
    status: EventStatus
    is_featured: bool
    is_platform_event: bool = False
    view_count: int
    created_at: datetime
