from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.booking import (
    BookingCreate, BookingResponse, PaymentCreateRequest, PaymentCreateResponse,
    PaymentVerificationRequest, PaymentVerificationResponse,
    BookingCancellationRequest, BookingCancellationResponse,
    SeatChangeRequest, SeatChangeResponse, TransactionHistoryResponse,
    BookingDetailsResponse
)
from app.models.booking import Booking, BookingStatus, PaymentStatus, BookedTicket, SeatInfo
from app.models.event import Event
from app.models.seat_layout import SeatLayout, SeatStatus
from app.models.user import User
from app.dependencies.auth import get_current_user
from app.services.email_service import email_service
from app.services.mqtt_service import mqtt_service
from app.core.config import settings
from typing import List
from datetime import datetime, timedelta
import razorpay
import hashlib
import hmac


router = APIRouter(prefix="/bookings", tags=["Bookings"])

# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new booking by selecting seats.
    This reserves the seats temporarily and creates a pending booking.
    User must complete payment within 10 minutes.
    """

    # Verify event exists
    event = await Event.get(booking_data.event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Get seat layout
    seat_layout = await SeatLayout.find_one({"event_id": booking_data.event_id})
    if not seat_layout:
        raise HTTPException(status_code=404, detail="Seat layout not found for this event")

    # Validate seats exist and are available
    selected_seats = []
    total_amount = 0.0

    for seat_id in booking_data.seat_ids:
        seat = next((s for s in seat_layout.seats if s.seat_id == seat_id), None)

        if not seat:
            raise HTTPException(status_code=404, detail=f"Seat {seat_id} not found")

        if seat.status != SeatStatus.AVAILABLE:
            raise HTTPException(
                status_code=400,
                detail=f"Seat {seat.seat_label} is not available (status: {seat.status})"
            )

        selected_seats.append(seat)
        total_amount += seat.current_price

    # Reserve seats (update status to RESERVED)
    lock_expires_at = datetime.utcnow() + timedelta(minutes=10)

    # Generate booking number
    booking_number = f"BK-{datetime.utcnow().strftime('%Y%m%d')}-{current_user.id[:8].upper()}"

    # Create booking
    booking = Booking(
        booking_number=booking_number,
        user_id=str(current_user.id),
        event_id=booking_data.event_id,
        organization_id=event.organization_id or "PLATFORM",
        tickets=[],
        total_tickets=len(selected_seats),
        total_amount=total_amount,
        contact_email=booking_data.contact_email,
        contact_phone=booking_data.contact_phone,
        status=BookingStatus.PENDING,
        payment_status=PaymentStatus.PENDING,
        lock_expires_at=lock_expires_at
    )

    await booking.insert()

    # Update seat layout - mark seats as RESERVED
    for seat in selected_seats:
        for s in seat_layout.seats:
            if s.seat_id == seat.seat_id:
                s.status = SeatStatus.RESERVED
                s.booking_id = str(booking.id)
                s.reserved_until = lock_expires_at

                # Create ticket
                section = next((sec for sec in seat_layout.sections if sec.section_id == seat.section_id), None)
                ticket = BookedTicket(
                    tier_id=seat.section_id,
                    tier_name=section.section_name if section else "General",
                    price_paid=seat.current_price,
                    seat_info=SeatInfo(
                        section_id=seat.section_id,
                        section_name=section.section_name if section else "General",
                        row=int(seat.row) if seat.row.isdigit() else None,
                        seat_number=int(seat.seat_number) if seat.seat_number.isdigit() else None,
                        seat_label=seat.seat_label
                    )
                )
                booking.tickets.append(ticket)

    await seat_layout.save()
    await booking.save()

    # Update event reserved count
    event.total_reserved += len(selected_seats)
    await event.save()

    # Publish MQTT update (mock)
    await mqtt_service.publish_seat_update(
        event_id=booking_data.event_id,
        seat_updates=[
            {"seat_id": s.seat_id, "status": "reserved", "booking_id": str(booking.id)}
            for s in selected_seats
        ]
    )

    return BookingResponse(
        id=str(booking.id),
        booking_number=booking.booking_number,
        user_id=booking.user_id,
        event_id=booking.event_id,
        organization_id=booking.organization_id,
        tickets=booking.tickets,
        total_tickets=booking.total_tickets,
        total_amount=booking.total_amount,
        payment_status=booking.payment_status,
        status=booking.status,
        contact_email=booking.contact_email,
        contact_phone=booking.contact_phone,
        created_at=booking.created_at,
        confirmed_at=booking.confirmed_at,
        cancelled_at=booking.cancelled_at
    )


@router.post("/payment/create", response_model=PaymentCreateResponse)
async def create_payment_order(
    payment_request: PaymentCreateRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Create Razorpay order for payment.
    Frontend will use this order_id to initiate Razorpay payment.
    """

    # Get booking (try by ID, fallback to booking_number)
    try:
        booking = await Booking.get(payment_request.booking_id)
    except Exception:
        # If not a valid ObjectId, try searching by booking_number
        booking = await Booking.find_one({"booking_number": payment_request.booking_id})

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Verify user owns this booking
    if booking.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check if booking is still pending
    if booking.status != BookingStatus.PENDING:
        raise HTTPException(status_code=400, detail="Booking is not in pending state")

    # Check if payment already exists
    if booking.razorpay_order_id:
        raise HTTPException(status_code=400, detail="Payment order already created")

    # Create Razorpay order
    event = await Event.get(booking.event_id)
    amount_in_paise = int(booking.total_amount * 100)  # Convert to paise

    razorpay_order = razorpay_client.order.create({
        "amount": amount_in_paise,
        "currency": event.currency if event.currency in ["INR", "USD"] else "INR",
        "receipt": booking.booking_number,
        "notes": {
            "booking_id": str(booking.id),
            "event_id": booking.event_id,
            "user_id": booking.user_id
        }
    })

    # Update booking with Razorpay order ID
    booking.razorpay_order_id = razorpay_order["id"]
    booking.payment_method = "razorpay"
    await booking.save()

    return PaymentCreateResponse(
        order_id=razorpay_order["id"],
        amount=booking.total_amount,
        currency=event.currency if event.currency in ["INR", "USD"] else "INR",
        booking_id=str(booking.id),
        razorpay_key_id=settings.RAZORPAY_KEY_ID
    )


@router.post("/payment/verify", response_model=PaymentVerificationResponse)
async def verify_payment(
    verification_request: PaymentVerificationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Verify Razorpay payment signature and confirm booking.
    """

    # Find booking by Razorpay order ID
    booking = await Booking.find_one({"razorpay_order_id": verification_request.razorpay_order_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Verify user owns this booking
    if booking.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Verify signature
    signature_payload = f"{verification_request.razorpay_order_id}|{verification_request.razorpay_payment_id}"
    expected_signature = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        signature_payload.encode(),
        hashlib.sha256
    ).hexdigest()

    if expected_signature != verification_request.razorpay_signature:
        # Payment failed - release seats
        await release_booking_seats(booking)
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    # Payment successful - confirm booking
    booking.razorpay_payment_id = verification_request.razorpay_payment_id
    booking.razorpay_signature = verification_request.razorpay_signature
    booking.payment_status = PaymentStatus.COMPLETED
    booking.status = BookingStatus.CONFIRMED
    booking.confirmed_at = datetime.utcnow()
    booking.payment_transaction_id = verification_request.razorpay_payment_id
    await booking.save()

    # Update seat layout - mark seats as BOOKED
    seat_layout = await SeatLayout.find_one({"event_id": booking.event_id})
    if seat_layout:
        for ticket in booking.tickets:
            for seat in seat_layout.seats:
                if seat.booking_id == str(booking.id) and seat.status == SeatStatus.RESERVED:
                    seat.status = SeatStatus.BOOKED
                    seat.reserved_until = None
        await seat_layout.save()

    # Update event counts (move from reserved to sold)
    event = await Event.get(booking.event_id)
    event.total_sold += booking.total_tickets
    event.total_reserved -= booking.total_tickets
    await event.save()

    # Publish MQTT update (mock)
    await mqtt_service.publish_booking_confirmation(
        event_id=booking.event_id,
        booking_data={
            "booking_id": str(booking.id),
            "booking_number": booking.booking_number,
            "total_tickets": booking.total_tickets
        }
    )

    # Send confirmation email
    event = await Event.get(booking.event_id)
    email_service.send_booking_confirmation_email(
        user_name=current_user.full_name,
        user_email=booking.contact_email,
        booking_number=booking.booking_number,
        event_title=event.title,
        event_date=event.start_datetime,
        total_tickets=booking.total_tickets,
        total_amount=booking.total_amount,
        tickets=booking.tickets
    )

    return PaymentVerificationResponse(
        success=True,
        booking_id=str(booking.id),
        booking_number=booking.booking_number,
        payment_status=booking.payment_status,
        message="Booking confirmed successfully"
    )


@router.get("/my-bookings", response_model=List[TransactionHistoryResponse])
async def get_my_bookings(
    current_user: User = Depends(get_current_user)
):
    """Get current user's booking history"""

    bookings = await Booking.find({"user_id": str(current_user.id)}).sort("-created_at").to_list()

    response = []
    for booking in bookings:
        event = await Event.get(booking.event_id)
        response.append(TransactionHistoryResponse(
            id=str(booking.id),
            booking_number=booking.booking_number,
            event_id=booking.event_id,
            event_title=event.title if event else "Unknown Event",
            event_date=event.start_datetime if event else datetime.utcnow(),
            total_amount=booking.total_amount,
            payment_status=booking.payment_status,
            booking_status=booking.status,
            total_tickets=booking.total_tickets,
            created_at=booking.created_at,
            confirmed_at=booking.confirmed_at
        ))

    return response


@router.get("/{booking_id}", response_model=BookingDetailsResponse)
async def get_booking_details(
    booking_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get detailed booking information"""

    # Get booking (try by ID, fallback to booking_number)
    try:
        booking = await Booking.get(booking_id)
    except Exception:
        booking = await Booking.find_one({"booking_number": booking_id})

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Verify user owns this booking
    if booking.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Get event details
    event = await Event.get(booking.event_id)
    event_dict = {
        "id": str(event.id),
        "title": event.title,
        "start_datetime": event.start_datetime,
        "venue_id": event.venue_id,
        "cover_image": event.cover_image
    }

    # Check if user can cancel (24 hours before event)
    can_cancel = False
    cancellation_deadline = None
    if booking.status == BookingStatus.CONFIRMED and event:
        cancellation_deadline = event.start_datetime - timedelta(hours=24)
        can_cancel = datetime.utcnow() < cancellation_deadline

    # Check if user can change seats (48 hours before event)
    can_change_seats = False
    if booking.status == BookingStatus.CONFIRMED and event:
        seat_change_deadline = event.start_datetime - timedelta(hours=48)
        can_change_seats = datetime.utcnow() < seat_change_deadline

    # Generate QR codes for each ticket (mock URLs)
    qr_codes = [
        f"{settings.FRONTEND_URL}/qr/{ticket.ticket_id}"
        for ticket in booking.tickets
    ]

    return BookingDetailsResponse(
        id=str(booking.id),
        booking_number=booking.booking_number,
        event=event_dict,
        tickets=booking.tickets,
        total_tickets=booking.total_tickets,
        total_amount=booking.total_amount,
        payment_status=booking.payment_status,
        booking_status=booking.status,
        qr_codes=qr_codes,
        contact_email=booking.contact_email,
        contact_phone=booking.contact_phone,
        created_at=booking.created_at,
        confirmed_at=booking.confirmed_at,
        can_cancel=can_cancel,
        can_change_seats=can_change_seats,
        cancellation_deadline=cancellation_deadline
    )


@router.post("/{booking_id}/cancel", response_model=BookingCancellationResponse)
async def cancel_booking(
    booking_id: str,
    cancellation_request: BookingCancellationRequest,
    current_user: User = Depends(get_current_user)
):
    """Cancel a confirmed booking and refund"""

    # Get booking (try by ID, fallback to booking_number)
    try:
        booking = await Booking.get(booking_id)
    except Exception:
        booking = await Booking.find_one({"booking_number": booking_id})

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Verify user owns this booking
    if booking.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check if booking can be cancelled
    if booking.status != BookingStatus.CONFIRMED:
        raise HTTPException(status_code=400, detail="Only confirmed bookings can be cancelled")

    event = await Event.get(booking.event_id)
    cancellation_deadline = event.start_datetime - timedelta(hours=24)

    if datetime.utcnow() >= cancellation_deadline:
        raise HTTPException(
            status_code=400,
            detail="Cannot cancel booking within 24 hours of event start"
        )

    # Release seats
    await release_booking_seats(booking)

    # Update booking status
    booking.status = BookingStatus.CANCELLED
    booking.cancelled_at = datetime.utcnow()
    await booking.save()

    # Update event counts
    event.total_sold -= booking.total_tickets
    await event.save()

    # TODO: Process refund via Razorpay
    # For now, just mark as refundable
    refund_amount = booking.total_amount * 0.9  # 10% cancellation fee

    # Send cancellation email
    email_service.send_booking_cancellation_email(
        user_name=current_user.full_name,
        user_email=booking.contact_email,
        booking_number=booking.booking_number,
        event_title=event.title,
        refund_amount=refund_amount
    )

    return BookingCancellationResponse(
        success=True,
        booking_id=str(booking.id),
        refund_amount=refund_amount,
        refund_status="pending",
        message="Booking cancelled successfully. Refund will be processed in 5-7 business days."
    )


@router.post("/{booking_id}/change-seats", response_model=SeatChangeResponse)
async def change_seats(
    booking_id: str,
    seat_change_request: SeatChangeRequest,
    current_user: User = Depends(get_current_user)
):
    """Change seats in an existing booking"""

    # Get booking (try by ID, fallback to booking_number)
    try:
        booking = await Booking.get(booking_id)
    except Exception:
        booking = await Booking.find_one({"booking_number": booking_id})

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Verify user owns this booking
    if booking.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check if booking can have seats changed
    if booking.status != BookingStatus.CONFIRMED:
        raise HTTPException(status_code=400, detail="Only confirmed bookings can have seats changed")

    event = await Event.get(booking.event_id)
    seat_change_deadline = event.start_datetime - timedelta(hours=48)

    if datetime.utcnow() >= seat_change_deadline:
        raise HTTPException(
            status_code=400,
            detail="Cannot change seats within 48 hours of event start"
        )

    # Validate new seats are available
    seat_layout = await SeatLayout.find_one({"event_id": booking.event_id})
    if not seat_layout:
        raise HTTPException(status_code=404, detail="Seat layout not found")

    # Check if same number of seats
    if len(seat_change_request.new_seat_ids) != booking.total_tickets:
        raise HTTPException(
            status_code=400,
            detail=f"Must select {booking.total_tickets} seats"
        )

    # Validate new seats
    new_seats = []
    new_total_amount = 0.0

    for seat_id in seat_change_request.new_seat_ids:
        seat = next((s for s in seat_layout.seats if s.seat_id == seat_id), None)
        if not seat:
            raise HTTPException(status_code=404, detail=f"Seat {seat_id} not found")
        if seat.status != SeatStatus.AVAILABLE:
            raise HTTPException(status_code=400, detail=f"Seat {seat.seat_label} is not available")
        new_seats.append(seat)
        new_total_amount += seat.current_price

    # Calculate price difference
    old_total = booking.total_amount
    price_difference = new_total_amount - old_total
    additional_charge = max(0, price_difference)
    refund_amount = max(0, -price_difference)

    # Release old seats
    old_seat_ids = []
    for ticket in booking.tickets:
        if ticket.seat_info:
            old_seat_ids.append(ticket.seat_info.seat_label)
            for seat in seat_layout.seats:
                if seat.booking_id == str(booking.id):
                    seat.status = SeatStatus.AVAILABLE
                    seat.booking_id = None
                    seat.reserved_until = None

    # Book new seats
    new_seat_labels = []
    booking.tickets = []
    for seat in new_seats:
        for s in seat_layout.seats:
            if s.seat_id == seat.seat_id:
                s.status = SeatStatus.BOOKED
                s.booking_id = str(booking.id)
                new_seat_labels.append(s.seat_label)

                section = next((sec for sec in seat_layout.sections if sec.section_id == seat.section_id), None)
                ticket = BookedTicket(
                    tier_id=seat.section_id,
                    tier_name=section.section_name if section else "General",
                    price_paid=seat.current_price,
                    seat_info=SeatInfo(
                        section_id=seat.section_id,
                        section_name=section.section_name if section else "General",
                        seat_label=seat.seat_label
                    )
                )
                booking.tickets.append(ticket)

    booking.total_amount = new_total_amount
    await booking.save()
    await seat_layout.save()

    # Send seat change confirmation email
    email_service.send_seat_change_confirmation_email(
        user_name=current_user.full_name,
        user_email=booking.contact_email,
        booking_number=booking.booking_number,
        event_title=event.title,
        old_seats=old_seat_ids,
        new_seats=new_seat_labels,
        additional_charge=additional_charge,
        refund_amount=refund_amount
    )

    return SeatChangeResponse(
        success=True,
        booking_id=str(booking.id),
        old_seats=old_seat_ids,
        new_seats=new_seat_labels,
        additional_charge=additional_charge,
        refund_amount=refund_amount,
        message="Seats changed successfully"
    )


async def release_booking_seats(booking: Booking):
    """Helper function to release seats back to available pool"""
    seat_layout = await SeatLayout.find_one({"event_id": booking.event_id})
    if seat_layout:
        for seat in seat_layout.seats:
            if seat.booking_id == str(booking.id):
                seat.status = SeatStatus.AVAILABLE
                seat.booking_id = None
                seat.reserved_until = None
        await seat_layout.save()

    # Publish MQTT update (mock)
    await mqtt_service.publish_seat_update(
        event_id=booking.event_id,
        seat_updates=[
            {"seat_id": s.seat_id, "status": "available", "booking_id": None}
            for s in seat_layout.seats
            if s.booking_id == str(booking.id)
        ]
    )
