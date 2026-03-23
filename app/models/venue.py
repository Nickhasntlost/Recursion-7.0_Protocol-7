from beanie import Document, Indexed
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class VenueType(str, Enum):
    STADIUM = "stadium"
    THEATER = "theater"
    CONFERENCE_HALL = "conference_hall"
    AUDITORIUM = "auditorium"
    OUTDOOR = "outdoor"
    ARENA = "arena"
    CONCERT_HALL = "concert_hall"
    OTHER = "other"


class Coordinates(BaseModel):
    latitude: float
    longitude: float


class SeatSection(BaseModel):
    section_id: str
    section_name: str  # e.g., "VIP", "General", "Balcony"
    rows: int
    seats_per_row: int
    total_seats: int
    base_price: float


class Amenity(BaseModel):
    name: str
    icon: Optional[str] = None


class Venue(Document):
    # Basic Info
    name: Indexed(str)  # Index for name search
    organization_id: str  # Owner organization

    # Location (INDEXED for fast AI venue suggestions)
    address: str
    city: str  # Index in Settings
    state: Optional[str] = None
    country: str  # Index in Settings
    postal_code: str
    coordinates: Optional[Coordinates] = None

    # Venue Details (INDEXED for AI filtering)
    venue_type: VenueType  # Index in Settings
    description: Optional[str] = None
    capacity: int  # Index in Settings

    # Seating
    sections: List[SeatSection] = []
    has_reserved_seating: bool = True

    # Media
    images: List[str] = []  # Image URLs (returned in AI suggestions)
    model_3d_url: Optional[str] = None  # .glb file for AR
    floor_plan_url: Optional[str] = None

    # Amenities (INDEXED for feature-based filtering)
    amenities: List[Amenity] = []
    has_parking: bool  # Index in Settings
    has_wifi: bool  # Index in Settings
    has_accessibility: bool  # Index in Settings

    # IoT Integration
    has_iot_sensors: bool = False
    camera_count: int = 0
    mqtt_topic_prefix: Optional[str] = None  # e.g., "venue/venue_id"

    # Contact
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None

    # Status (INDEXED for active venue filtering)
    is_active: bool  # Index in Settings
    is_verified: bool  # Index in Settings

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "venues"
        indexes = [
            "organization_id",
            "city",  # Location search
            "country",  # Country filtering
            "venue_type",  # Type filtering
            "capacity",  # Capacity range queries
            "is_active",  # Active venues only
            "is_verified",  # Verified venues
            "has_parking",  # Amenity filters
            "has_wifi",
            "has_accessibility",
            # Compound indexes for AI queries
            [("city", 1), ("capacity", 1), ("is_active", 1)],  # Location + capacity
            [("venue_type", 1), ("city", 1), ("is_active", 1)],  # Type + location
        ]

    class Config:
        protected_namespaces = ()  # Allow model_3d_url field
        json_schema_extra = {
            "example": {
                "name": "Grand Arena",
                "organization_id": "org_id_here",
                "address": "123 Main St",
                "city": "Los Angeles",
                "country": "USA",
                "postal_code": "90001",
                "venue_type": "arena",
                "capacity": 20000,
                "has_reserved_seating": True
            }
        }
