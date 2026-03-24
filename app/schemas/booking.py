from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from app.models.booking import BookingStatus, PaymentStatus, BookedTicket, SeatInfo


class BookingCreate(BaseModel):
    event_id: str
    seat_ids: List[str]  # List of seat IDs to book
    contact_email: EmailStr
    contact_phone: Optional[str] = None


class BookingResponse(BaseModel):
    id: str
    booking_number: str
    user_id: str
    event_id: str
    organization_id: str
    tickets: List[BookedTicket]
    total_tickets: int
    total_amount: float
    payment_status: PaymentStatus
    payment_method: Optional[str] = None
    payment_transaction_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    status: BookingStatus
    contact_email: str
    contact_phone: Optional[str] = None
    created_at: datetime
    confirmed_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None


class PaymentCreateRequest(BaseModel):
    """Request to initiate payment (creates Razorpay order)"""
    booking_id: str


class PaymentCreateResponse(BaseModel):
    """Response with Razorpay order details"""
    order_id: str
    amount: float
    currency: str
    booking_id: str
    razorpay_key_id: str  # For frontend Razorpay integration


class PaymentVerificationRequest(BaseModel):
    """Request to verify Razorpay payment"""
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentVerificationResponse(BaseModel):
    """Response after payment verification"""
    success: bool
    booking_id: str
    booking_number: str
    payment_status: PaymentStatus
    message: str


class BookingCancellationRequest(BaseModel):
    """Request to cancel a booking"""
    reason: Optional[str] = None


class BookingCancellationResponse(BaseModel):
    """Response after booking cancellation"""
    success: bool
    booking_id: str
    refund_amount: float
    refund_status: str
    message: str


class SeatChangeRequest(BaseModel):
    """Request to change seats in existing booking"""
    new_seat_ids: List[str]  # New seat IDs to replace old ones
    reason: Optional[str] = None


class SeatChangeResponse(BaseModel):
    """Response after seat change"""
    success: bool
    booking_id: str
    old_seats: List[str]
    new_seats: List[str]
    additional_charge: float
    refund_amount: float
    message: str


class TransactionHistoryResponse(BaseModel):
    """User's transaction history"""
    id: str
    booking_number: str
    event_id: str
    event_title: str
    event_date: datetime
    total_amount: float
    payment_status: PaymentStatus
    booking_status: BookingStatus
    total_tickets: int
    created_at: datetime
    confirmed_at: Optional[datetime] = None


class BookingDetailsResponse(BaseModel):
    """Detailed booking information for user"""
    id: str
    booking_number: str
    event: dict  # Event details
    tickets: List[BookedTicket]
    total_tickets: int
    total_amount: float
    payment_status: PaymentStatus
    booking_status: BookingStatus
    qr_codes: List[str]  # List of QR code URLs for each ticket
    contact_email: str
    contact_phone: Optional[str] = None
    created_at: datetime
    confirmed_at: Optional[datetime] = None
    can_cancel: bool  # Can user cancel this booking?
    can_change_seats: bool  # Can user change seats?
    cancellation_deadline: Optional[datetime] = None
