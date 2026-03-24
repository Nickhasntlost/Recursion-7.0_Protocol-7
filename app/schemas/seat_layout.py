from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.seat_layout import (
    SeatStatus, LayoutType, PriceCategory, Seat, SeatSection
)


class SeatResponse(BaseModel):
    seat_id: str
    row: str
    seat_number: str
    seat_label: str
    section_id: str
    price_category: PriceCategory
    base_price: float
    current_price: float
    status: SeatStatus
    is_accessible: bool
    is_aisle: bool
    booking_id: Optional[str] = None
    reserved_until: Optional[datetime] = None
    x_position: Optional[int] = None
    y_position: Optional[int] = None


class SeatSectionResponse(BaseModel):
    section_id: str
    section_name: str
    section_code: str
    layout_type: LayoutType
    table_number: Optional[int] = None
    seats_per_table: Optional[int] = None
    total_seats: int
    available_seats: int
    price_category: PriceCategory
    base_price: float
    color_code: Optional[str] = None
    floor_level: Optional[int] = None


class SeatLayoutResponse(BaseModel):
    id: str
    event_id: str
    venue_id: str
    layout_type: LayoutType
    total_capacity: int
    sections: List[SeatSectionResponse]
    seats: List[SeatResponse]
    enable_realtime_sync: bool
    created_at: datetime


class SeatLayoutCreate(BaseModel):
    event_id: str
    venue_id: str
    layout_type: LayoutType
    sections: List[SeatSection]
    seats: List[Seat]
    enable_realtime_sync: bool = True


class SeatReservationRequest(BaseModel):
    seat_ids: List[str]  # List of seat IDs to reserve
    duration_minutes: int = 10  # How long to hold the reservation


class SeatReservationResponse(BaseModel):
    success: bool
    reserved_seats: List[str]
    failed_seats: List[str]
    reservation_expires_at: datetime
    message: str


class SectionAvailabilityResponse(BaseModel):
    section_id: str
    section_name: str
    total: int
    available: int
    reserved: int
    booked: int
    percentage_available: float
