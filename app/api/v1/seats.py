from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.seat_layout import (
    SeatLayoutResponse, SeatLayoutCreate, SeatReservationRequest,
    SeatReservationResponse, SectionAvailabilityResponse,
    SeatResponse, SeatSectionResponse
)
from app.models.seat_layout import SeatLayout, SeatStatus
from app.models.event import Event
from app.models.user import User
from app.dependencies.auth import get_current_user, get_current_organizer
from app.services.mqtt_service import mqtt_service
from typing import List, Optional
from datetime import datetime, timedelta


router = APIRouter(prefix="/seats", tags=["Seat Layouts"])


@router.post("/", response_model=SeatLayoutResponse, status_code=status.HTTP_201_CREATED)
async def create_seat_layout(
    seat_layout_data: SeatLayoutCreate,
    current_user: User = Depends(get_current_organizer)
):
    """Create seat layout for an event (Organizer only)"""

    # Verify event exists and belongs to user's organization
    event = await Event.get(seat_layout_data.event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if not event.is_platform_event and event.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check if layout already exists
    existing = await SeatLayout.find_one({"event_id": seat_layout_data.event_id})
    if existing:
        raise HTTPException(status_code=400, detail="Seat layout already exists for this event")

    # Create seat layout
    seat_layout = SeatLayout(
        event_id=seat_layout_data.event_id,
        venue_id=seat_layout_data.venue_id,
        layout_type=seat_layout_data.layout_type,
        total_capacity=event.total_capacity,
        sections=seat_layout_data.sections,
        seats=seat_layout_data.seats,
        enable_realtime_sync=seat_layout_data.enable_realtime_sync,
        mqtt_topic=f"event/{seat_layout_data.event_id}/seats"
    )

    await seat_layout.insert()

    # Initialize MQTT connection (mock)
    if seat_layout.enable_realtime_sync:
        await mqtt_service.connect()
        print(f"✅ MQTT enabled for event {seat_layout_data.event_id}")

    return SeatLayoutResponse(
        id=str(seat_layout.id),
        event_id=seat_layout.event_id,
        venue_id=seat_layout.venue_id,
        layout_type=seat_layout.layout_type,
        total_capacity=seat_layout.total_capacity,
        sections=[
            SeatSectionResponse(**section.dict())
            for section in seat_layout.sections
        ],
        seats=[
            SeatResponse(**seat.dict())
            for seat in seat_layout.seats
        ],
        enable_realtime_sync=seat_layout.enable_realtime_sync,
        created_at=seat_layout.created_at
    )


@router.get("/{event_id}", response_model=SeatLayoutResponse)
async def get_seat_layout(event_id: str):
    """Get seat layout for an event (Public)"""

    seat_layout = await SeatLayout.find_one({"event_id": event_id})
    if not seat_layout:
        raise HTTPException(status_code=404, detail="Seat layout not found")

    return SeatLayoutResponse(
        id=str(seat_layout.id),
        event_id=seat_layout.event_id,
        venue_id=seat_layout.venue_id,
        layout_type=seat_layout.layout_type,
        total_capacity=seat_layout.total_capacity,
        sections=[
            SeatSectionResponse(**section.dict())
            for section in seat_layout.sections
        ],
        seats=[
            SeatResponse(**seat.dict())
            for seat in seat_layout.seats
        ],
        enable_realtime_sync=seat_layout.enable_realtime_sync,
        created_at=seat_layout.created_at
    )


@router.get("/{event_id}/availability")
async def get_seat_availability(event_id: str):
    """Get real-time seat availability summary"""

    seat_layout = await SeatLayout.find_one({"event_id": event_id})
    if not seat_layout:
        raise HTTPException(status_code=404, detail="Seat layout not found")

    # Overall availability
    available_count = seat_layout.get_available_seats_count()

    # Section-wise availability
    sections_availability = []
    for section in seat_layout.sections:
        availability = seat_layout.get_section_availability(section.section_id)
        sections_availability.append(
            SectionAvailabilityResponse(
                section_id=section.section_id,
                section_name=section.section_name,
                total=availability["total"],
                available=availability["available"],
                reserved=availability["reserved"],
                booked=availability["booked"],
                percentage_available=(availability["available"] / availability["total"] * 100)
                if availability["total"] > 0 else 0
            )
        )

    return {
        "event_id": event_id,
        "total_capacity": seat_layout.total_capacity,
        "available_seats": available_count,
        "reserved_seats": sum(1 for s in seat_layout.seats if s.status == SeatStatus.RESERVED),
        "booked_seats": sum(1 for s in seat_layout.seats if s.status == SeatStatus.BOOKED),
        "sections": sections_availability,
        "last_updated": datetime.utcnow()
    }


@router.post("/{event_id}/reserve", response_model=SeatReservationResponse)
async def reserve_seats_temporarily(
    event_id: str,
    reservation_request: SeatReservationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Temporarily reserve seats (for cart functionality).
    Seats will be auto-released after expiry if not booked.
    """

    seat_layout = await SeatLayout.find_one({"event_id": event_id})
    if not seat_layout:
        raise HTTPException(status_code=404, detail="Seat layout not found")

    reserved_seats = []
    failed_seats = []
    reservation_expires_at = datetime.utcnow() + timedelta(minutes=reservation_request.duration_minutes)

    for seat_id in reservation_request.seat_ids:
        seat = next((s for s in seat_layout.seats if s.seat_id == seat_id), None)

        if not seat:
            failed_seats.append(seat_id)
            continue

        if seat.status != SeatStatus.AVAILABLE:
            failed_seats.append(seat_id)
            continue

        # Reserve the seat
        seat.status = SeatStatus.RESERVED
        seat.reserved_until = reservation_expires_at
        reserved_seats.append(seat_id)

    if reserved_seats:
        await seat_layout.save()

        # Publish MQTT update (mock)
        await mqtt_service.publish_seat_update(
            event_id=event_id,
            seat_updates=[
                {"seat_id": sid, "status": "reserved"}
                for sid in reserved_seats
            ]
        )

    return SeatReservationResponse(
        success=len(reserved_seats) > 0,
        reserved_seats=reserved_seats,
        failed_seats=failed_seats,
        reservation_expires_at=reservation_expires_at,
        message=f"Reserved {len(reserved_seats)} seats. {len(failed_seats)} seats unavailable."
    )


@router.get("/{event_id}/section/{section_id}/seats", response_model=List[SeatResponse])
async def get_section_seats(event_id: str, section_id: str):
    """Get all seats in a specific section"""

    seat_layout = await SeatLayout.find_one({"event_id": event_id})
    if not seat_layout:
        raise HTTPException(status_code=404, detail="Seat layout not found")

    section_seats = [
        SeatResponse(**seat.dict())
        for seat in seat_layout.seats
        if seat.section_id == section_id
    ]

    return section_seats
