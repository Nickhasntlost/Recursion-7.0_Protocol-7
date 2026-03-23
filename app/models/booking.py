from beanie import Document, Indexed
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class BookingStatus(str, Enum):
    PENDING = "pending"  # In cart, temporary lock
    CONFIRMED = "confirmed"  # Payment successful
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    CHECKED_IN = "checked_in"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class SeatInfo(BaseModel):
    section_id: str
    section_name: str
    row: Optional[int] = None
    seat_number: Optional[int] = None
    seat_label: Optional[str] = None  # e.g., "A-12"


class BookedTicket(BaseModel):
    ticket_id: str = Field(default_factory=lambda: f"TKT-{datetime.utcnow().timestamp()}")
    tier_id: str
    tier_name: str
    price_paid: float
    seat_info: Optional[SeatInfo] = None

    # NFT/Blockchain
    nft_token_id: Optional[str] = None
    blockchain_tx_hash: Optional[str] = None

    # QR Code
    qr_code_url: Optional[str] = None
    qr_code_data: Optional[str] = None

    # Check-in
    is_checked_in: bool = False
    checked_in_at: Optional[datetime] = None


class Booking(Document):
    booking_number: Indexed(str, unique=True)

    # References
    user_id: str
    event_id: str
    organization_id: str

    # Tickets
    tickets: List[BookedTicket]
    total_tickets: int
    total_amount: float

    # Payment
    payment_status: PaymentStatus = PaymentStatus.PENDING
    payment_method: Optional[str] = None  # "razorpay", "stripe", "paypal", "crypto"
    payment_transaction_id: Optional[str] = None

    # Razorpay specific fields
    razorpay_order_id: Optional[str] = None  # Order ID from create_order
    razorpay_payment_id: Optional[str] = None  # Payment ID after successful payment
    razorpay_signature: Optional[str] = None  # Signature for verification

    # Booking Status
    status: BookingStatus = BookingStatus.PENDING

    # Lock expiry (for cart reservations)
    lock_expires_at: Optional[datetime] = None

    # Contact
    contact_email: str
    contact_phone: Optional[str] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    confirmed_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None

    # Versioning for optimistic locking
    version: int = 1

    class Settings:
        name = "bookings"
        indexes = [
            "booking_number",
            "user_id",
            "event_id",
            "status",
            "payment_status",
            "created_at",
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "booking_number": "BK-20260315-ABC123",
                "user_id": "user_id",
                "event_id": "event_id",
                "total_tickets": 2,
                "total_amount": 150.0,
                "contact_email": "user@example.com"
            }
        }
