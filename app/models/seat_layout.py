from beanie import Document, Indexed
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class SeatStatus(str, Enum):
    AVAILABLE = "available"
    RESERVED = "reserved"  # Temporarily locked during booking
    BOOKED = "booked"  # Confirmed booking
    BLOCKED = "blocked"  # Maintenance/VIP hold
    UNAVAILABLE = "unavailable"  # Physically doesn't exist


class LayoutType(str, Enum):
    STADIUM = "stadium"  # Rows and seat numbers
    THEATER = "theater"  # Traditional theater seating
    DINNER = "dinner"  # Table-based seating
    STANDING = "standing"  # General admission, no specific seats
    CUSTOM = "custom"  # Custom layout


class PriceCategory(str, Enum):
    VIP = "vip"
    PREMIUM = "premium"
    STANDARD = "standard"
    ECONOMY = "economy"


class Seat(BaseModel):
    seat_id: str = Field(default_factory=lambda: f"SEAT-{datetime.utcnow().timestamp()}")

    # Position
    row: str  # "A", "B", "1", "2"
    seat_number: str  # "1", "2", "12"
    seat_label: str  # Display label like "A-12"

    # Section reference
    section_id: str

    # Pricing
    price_category: PriceCategory
    base_price: float
    current_price: float  # For dynamic pricing

    # Status
    status: SeatStatus = SeatStatus.AVAILABLE

    # Accessibility
    is_accessible: bool = False  # Wheelchair accessible
    is_aisle: bool = False

    # Booking reference
    booking_id: Optional[str] = None
    reserved_until: Optional[datetime] = None  # Auto-release after expiry

    # Position in grid (for visual rendering)
    x_position: Optional[int] = None
    y_position: Optional[int] = None


class SeatSection(BaseModel):
    section_id: str = Field(default_factory=lambda: f"SEC-{datetime.utcnow().timestamp()}")
    section_name: str  # "VIP", "General", "Balcony", "Table 5"
    section_code: str  # "VIP", "GA", "BAL", "T5"

    # Layout type specific
    layout_type: LayoutType

    # For table-based (dinner events)
    table_number: Optional[int] = None
    seats_per_table: Optional[int] = None

    # Capacity
    total_seats: int
    available_seats: int = 0

    # Pricing
    price_category: PriceCategory
    base_price: float

    # Visual properties
    color_code: Optional[str] = None  # Hex color for UI rendering

    # Position in venue
    floor_level: Optional[int] = None  # 0=ground, 1=first floor, etc.


class SeatLayout(Document):
    """Master seat layout for an event"""

    # References
    event_id: Indexed(str, unique=True)  # One layout per event
    venue_id: str

    # Layout configuration
    layout_type: LayoutType
    total_capacity: int

    # Sections (areas like VIP, General, Balcony)
    sections: List[SeatSection] = []

    # All seats (flat list for easy querying)
    seats: List[Seat] = []

    # MQTT configuration for real-time updates
    mqtt_topic: Optional[str] = None  # e.g., "event/123/seats"
    enable_realtime_sync: bool = True

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "seat_layouts"
        indexes = [
            "event_id",
            "venue_id",
        ]

    def get_available_seats_count(self) -> int:
        """Count available seats"""
        return sum(1 for seat in self.seats if seat.status == SeatStatus.AVAILABLE)

    def get_section_availability(self, section_id: str) -> dict:
        """Get availability for a specific section"""
        section_seats = [s for s in self.seats if s.section_id == section_id]
        return {
            "total": len(section_seats),
            "available": sum(1 for s in section_seats if s.status == SeatStatus.AVAILABLE),
            "reserved": sum(1 for s in section_seats if s.status == SeatStatus.RESERVED),
            "booked": sum(1 for s in section_seats if s.status == SeatStatus.BOOKED),
        }
