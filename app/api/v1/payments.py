from fastapi import APIRouter, HTTPException, status, Depends, Request, Header
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from bson import ObjectId

from app.models.booking import Booking, BookingStatus, PaymentStatus, BookedTicket
from app.models.event import Event
from app.models.user import User
from app.dependencies.auth import get_current_user
from app.services.payment_service import payment_service
from app.core.config import settings
import json

router = APIRouter(prefix="/payments", tags=["Payments"])


class CreatePaymentOrderRequest(BaseModel):
    event_id: str
    ticket_tier_id: str
    quantity: int = 1
    contact_email: str
    contact_phone: Optional[str] = None


class CreatePaymentOrderResponse(BaseModel):
    booking_id: str
    order_id: str  # Razorpay order ID
    amount: float  # In rupees
    currency: str
    razorpay_key_id: str  # For client-side Razorpay checkout
    booking_number: str
    expires_at: datetime


class VerifyPaymentRequest(BaseModel):
    booking_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class VerifyPaymentResponse(BaseModel):
    success: bool
    booking_id: str
    booking_number: str
    payment_status: str
    booking_status: str
    message: str


@router.post("/create-order", response_model=CreatePaymentOrderResponse)
async def create_payment_order(
    request: CreatePaymentOrderRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Step 1: Create Razorpay payment order for event booking
    This locks seats temporarily and creates a Razorpay order
    """

    # Validate event
    event = await Event.get(request.event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Find ticket tier
    ticket_tier = None
    for tier in event.ticket_tiers:
        if str(tier.tier_id) == request.ticket_tier_id:
            ticket_tier = tier
            break

    if not ticket_tier:
        raise HTTPException(status_code=404, detail="Ticket tier not found")

    # Check availability (calculate from total_capacity - total_sold - total_reserved)
    available_capacity = event.total_capacity - event.total_sold - event.total_reserved
    if available_capacity < request.quantity:
        raise HTTPException(status_code=400, detail="Not enough tickets available")

    # Also check specific tier availability
    if ticket_tier.available_quantity < request.quantity:
        raise HTTPException(status_code=400, detail=f"Only {ticket_tier.available_quantity} tickets available in this tier")

    # Calculate total amount
    total_amount = ticket_tier.price * request.quantity

    # Generate booking number
    booking_number = f"BK-{datetime.utcnow().strftime('%Y%m%d')}-{ObjectId()}"

    # Create booking (PENDING state)
    tickets = []
    for i in range(request.quantity):
        ticket = BookedTicket(
            tier_id=str(ticket_tier.tier_id),
            tier_name=ticket_tier.tier_name,
            price_paid=ticket_tier.price
        )
        tickets.append(ticket)

    booking = Booking(
        booking_number=booking_number,
        user_id=str(current_user.id),
        event_id=str(event.id),
        organization_id=event.organization_id,
        tickets=tickets,
        total_tickets=request.quantity,
        total_amount=total_amount,
        contact_email=request.contact_email,
        contact_phone=request.contact_phone,
        payment_status=PaymentStatus.PENDING,
        payment_method="razorpay",
        status=BookingStatus.PENDING,
        lock_expires_at=datetime.utcnow() + timedelta(minutes=15)  # 15 min to complete payment
    )

    await booking.insert()

    # Temporarily reserve tickets (lock them for 15 minutes)
    event.total_reserved += request.quantity

    # Reduce tier availability
    for tier in event.ticket_tiers:
        if str(tier.tier_id) == request.ticket_tier_id:
            tier.available_quantity -= request.quantity
            break

    await event.save()

    # Create Razorpay order
    try:
        razorpay_order = payment_service.create_order(
            amount=total_amount,
            currency=event.currency,
            receipt=booking_number,
            notes={
                "booking_id": str(booking.id),
                "event_id": str(event.id),
                "user_id": str(current_user.id),
                "event_title": event.title
            }
        )

        # Store Razorpay order ID in booking
        booking.razorpay_order_id = razorpay_order['id']
        await booking.save()

        return CreatePaymentOrderResponse(
            booking_id=str(booking.id),
            order_id=razorpay_order['id'],
            amount=total_amount,
            currency=event.currency,
            razorpay_key_id=settings.RAZORPAY_KEY_ID,
            booking_number=booking_number,
            expires_at=booking.lock_expires_at
        )

    except Exception as e:
        # Rollback: Delete booking and restore capacity
        await booking.delete()
        event.total_reserved -= request.quantity

        # Restore tier availability
        for tier in event.ticket_tiers:
            if str(tier.tier_id) == request.ticket_tier_id:
                tier.available_quantity += request.quantity
                break

        await event.save()
        raise HTTPException(status_code=500, detail=f"Payment order creation failed: {str(e)}")


@router.post("/verify", response_model=VerifyPaymentResponse)
async def verify_payment(
    request: VerifyPaymentRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Step 2: Verify payment signature after user completes payment on frontend
    This confirms the booking and updates payment status
    """

    # Get booking
    booking = await Booking.get(request.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Verify ownership
    if booking.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check if already verified
    if booking.payment_status == PaymentStatus.COMPLETED:
        return VerifyPaymentResponse(
            success=True,
            booking_id=str(booking.id),
            booking_number=booking.booking_number,
            payment_status=booking.payment_status,
            booking_status=booking.status,
            message="Payment already verified"
        )

    # Verify signature
    is_valid = payment_service.verify_payment_signature(
        razorpay_order_id=request.razorpay_order_id,
        razorpay_payment_id=request.razorpay_payment_id,
        razorpay_signature=request.razorpay_signature
    )

    if not is_valid:
        # Mark payment as failed
        booking.payment_status = PaymentStatus.FAILED
        booking.status = BookingStatus.CANCELLED
        await booking.save()

        # Restore capacity
        event = await Event.get(booking.event_id)
        event.total_reserved -= booking.total_tickets

        # Restore tier availability
        for ticket in booking.tickets:
            for tier in event.ticket_tiers:
                if str(tier.tier_id) == ticket.tier_id:
                    tier.available_quantity += 1
                    break

        await event.save()

        raise HTTPException(status_code=400, detail="Payment signature verification failed")

    # Payment successful - Update booking
    booking.razorpay_payment_id = request.razorpay_payment_id
    booking.razorpay_signature = request.razorpay_signature
    booking.payment_transaction_id = request.razorpay_payment_id
    booking.payment_status = PaymentStatus.COMPLETED
    booking.status = BookingStatus.CONFIRMED
    booking.confirmed_at = datetime.utcnow()
    booking.updated_at = datetime.utcnow()

    await booking.save()

    # Update event stats
    event = await Event.get(booking.event_id)
    event.total_sold += booking.total_tickets
    event.total_reserved -= booking.total_tickets  # Move from reserved to sold
    await event.save()

    return VerifyPaymentResponse(
        success=True,
        booking_id=str(booking.id),
        booking_number=booking.booking_number,
        payment_status=booking.payment_status,
        booking_status=booking.status,
        message="Payment verified successfully! Booking confirmed."
    )


@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(None)
):
    """
    Razorpay webhook handler for payment events
    Handles: payment.authorized, payment.captured, payment.failed, refund.created
    """

    # Read raw body
    body = await request.body()
    body_str = body.decode('utf-8')

    # Verify webhook signature
    if not x_razorpay_signature:
        raise HTTPException(status_code=400, detail="Missing signature header")

    is_valid = payment_service.verify_webhook_signature(
        webhook_body=body_str,
        webhook_signature=x_razorpay_signature
    )

    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    # Parse webhook data
    try:
        webhook_data = json.loads(body_str)
        event_type = webhook_data.get('event')
        payload = webhook_data.get('payload', {}).get('payment', {}).get('entity', {})

        # Extract payment details
        payment_id = payload.get('id')
        order_id = payload.get('order_id')
        status = payload.get('status')

        # Find booking by order_id
        booking = await Booking.find_one({"razorpay_order_id": order_id})

        if not booking:
            return {"status": "ignored", "reason": "Booking not found"}

        # Handle different events
        if event_type == "payment.captured":
            # Payment successful
            booking.payment_status = PaymentStatus.COMPLETED
            booking.status = BookingStatus.CONFIRMED
            booking.razorpay_payment_id = payment_id
            booking.confirmed_at = datetime.utcnow()
            await booking.save()

            # Update event stats
            event = await Event.get(booking.event_id)
            event.total_sold += booking.total_tickets
            event.total_reserved -= booking.total_tickets  # Move from reserved to sold
            await event.save()

        elif event_type == "payment.failed":
            # Payment failed
            booking.payment_status = PaymentStatus.FAILED
            booking.status = BookingStatus.CANCELLED
            await booking.save()

            # Restore capacity
            event = await Event.get(booking.event_id)
            event.total_reserved -= booking.total_tickets

            # Restore tier availability
            for ticket in booking.tickets:
                for tier in event.ticket_tiers:
                    if str(tier.tier_id) == ticket.tier_id:
                        tier.available_quantity += 1
                        break

            await event.save()

        elif event_type == "refund.created":
            # Refund processed
            booking.payment_status = PaymentStatus.REFUNDED
            booking.status = BookingStatus.REFUNDED
            await booking.save()

        return {"status": "success", "event": event_type}

    except Exception as e:
        print(f"Webhook processing error: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")


@router.get("/order-status/{order_id}")
async def get_order_status(
    order_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get Razorpay order status"""

    try:
        order = payment_service.fetch_order(order_id)
        return {
            "order_id": order['id'],
            "amount": order['amount'] / 100,  # Convert paise to rupees
            "currency": order['currency'],
            "status": order['status'],
            "created_at": order['created_at']
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Order not found: {str(e)}")


@router.get("/my-bookings")
async def get_my_bookings(
    current_user: User = Depends(get_current_user)
):
    """Get user's bookings with payment status"""

    bookings = await Booking.find({
        "user_id": str(current_user.id)
    }).sort("-created_at").to_list()

    return [
        {
            "booking_id": str(b.id),
            "booking_number": b.booking_number,
            "event_id": b.event_id,
            "total_tickets": b.total_tickets,
            "total_amount": b.total_amount,
            "payment_status": b.payment_status,
            "booking_status": b.status,
            "created_at": b.created_at,
            "confirmed_at": b.confirmed_at
        }
        for b in bookings
    ]
