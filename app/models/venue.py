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
    name: Indexed(str)
    organization_id: str  # Owner organization

    # Location
    address: str
    city: str
    state: Optional[str] = None
    country: str
    postal_code: str
    coordinates: Optional[Coordinates] = None

    # Venue Details
    venue_type: VenueType
    description: Optional[str] = None
    capacity: int

    # Seating
    sections: List[SeatSection] = []
    has_reserved_seating: bool = True

    # Media
    images: List[str] = []  # Image URLs
    model_3d_url: Optional[str] = None  # .glb file for AR
    floor_plan_url: Optional[str] = None

    # Amenities
    amenities: List[Amenity] = []
    has_parking: bool = False
    has_wifi: bool = False
    has_accessibility: bool = False

    # IoT Integration
    has_iot_sensors: bool = False
    camera_count: int = 0
    mqtt_topic_prefix: Optional[str] = None  # e.g., "venue/venue_id"

    # Contact
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None

    # Status
    is_active: bool = True
    is_verified: bool = False

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "venues"
        indexes = [
            "organization_id",
            "city",
            "venue_type",
            "is_active",
        ]

    class Config:
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
