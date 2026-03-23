from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.models.event import Event, EventStatus, EventCategory, TicketTier
from app.models.organization import Organization
from app.models.venue import Venue
from app.models.user import User
from app.dependencies.auth import get_current_organizer
from typing import List, Optional
from datetime import datetime
import re

router = APIRouter(prefix="/events", tags=["Events"])


def create_slug(title: str) -> str:
    """Create URL-friendly slug from title"""
    slug = title.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_data: EventCreate,
    current_user: User = Depends(get_current_organizer)
):
    """Create a new event (organizers only)"""

    # Verify user has an organization
    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must create an organization first"
        )

    # Verify organization exists
    organization = await Organization.get(current_user.organization_id)
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )

    # Verify venue exists
    venue = await Venue.get(event_data.venue_id)
    if not venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Venue not found"
        )

    # Verify venue belongs to organization
    if venue.organization_id != current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Venue does not belong to your organization"
        )

    # Create slug
    base_slug = create_slug(event_data.title)
    slug = base_slug
    counter = 1

    # Ensure unique slug
    while await Event.find_one({"slug": slug}):
        slug = f"{base_slug}-{counter}"
        counter += 1

    # Calculate total capacity and price range
    total_capacity = sum(tier.total_quantity for tier in event_data.ticket_tiers)
    min_price = min(tier.price for tier in event_data.ticket_tiers)
    max_price = max(tier.price for tier in event_data.ticket_tiers)

    # Initialize available quantities
    for tier in event_data.ticket_tiers:
        tier.available_quantity = tier.total_quantity
        tier.current_price = tier.price

    # Create event
    new_event = Event(
        title=event_data.title,
        slug=slug,
        description=event_data.description,
        organization_id=current_user.organization_id,
        venue_id=event_data.venue_id,
        category=event_data.category,
        tags=event_data.tags,
        start_datetime=event_data.start_datetime,
        end_datetime=event_data.end_datetime,
        doors_open=event_data.doors_open,
        ticket_tiers=event_data.ticket_tiers,
        total_capacity=total_capacity,
        min_price=min_price,
        max_price=max_price,
        cover_image=event_data.cover_image,
        performers=event_data.performers,
        allow_waitlist=event_data.allow_waitlist,
        max_tickets_per_user=event_data.max_tickets_per_user,
        enable_dynamic_pricing=event_data.enable_dynamic_pricing,
        status=EventStatus.DRAFT
    )

    await new_event.insert()

    # Update organization event count
    organization.total_events += 1
    await organization.save()

    return EventResponse(
        id=str(new_event.id),
        title=new_event.title,
        slug=new_event.slug,
        description=new_event.description,
        organization_id=new_event.organization_id,
        venue_id=new_event.venue_id,
        category=new_event.category,
        tags=new_event.tags,
        start_datetime=new_event.start_datetime,
        end_datetime=new_event.end_datetime,
        ticket_tiers=new_event.ticket_tiers,
        total_capacity=new_event.total_capacity,
        total_sold=new_event.total_sold,
        min_price=new_event.min_price,
        max_price=new_event.max_price,
        currency=new_event.currency,
        cover_image=new_event.cover_image,
        performers=new_event.performers,
        status=new_event.status,
        is_featured=new_event.is_featured,
        view_count=new_event.view_count,
        created_at=new_event.created_at
    )


@router.get("", response_model=List[EventResponse])
async def get_events(
    skip: int = 0,
    limit: int = 20,
    category: Optional[EventCategory] = None,
    city: Optional[str] = None,
    status: EventStatus = EventStatus.PUBLISHED,
    search: Optional[str] = None
):
    """Get list of events with filters"""

    query = {"status": status}

    if category:
        query["category"] = category

    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}}
        ]

    events = await Event.find(query).skip(skip).limit(limit).sort("-created_at").to_list()

    # Filter by city if provided (requires venue lookup)
    if city:
        filtered_events = []
        for event in events:
            venue = await Venue.get(event.venue_id)
            if venue and venue.city.lower() == city.lower():
                filtered_events.append(event)
        events = filtered_events

    return [
        EventResponse(
            id=str(event.id),
            title=event.title,
            slug=event.slug,
            description=event.description,
            organization_id=event.organization_id,
            venue_id=event.venue_id,
            category=event.category,
            tags=event.tags,
            start_datetime=event.start_datetime,
            end_datetime=event.end_datetime,
            ticket_tiers=event.ticket_tiers,
            total_capacity=event.total_capacity,
            total_sold=event.total_sold,
            min_price=event.min_price,
            max_price=event.max_price,
            currency=event.currency,
            cover_image=event.cover_image,
            performers=event.performers,
            status=event.status,
            is_featured=event.is_featured,
            view_count=event.view_count,
            created_at=event.created_at
        )
        for event in events
    ]


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str):
    """Get event by ID"""

    event = await Event.get(event_id)

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Increment view count
    event.view_count += 1
    await event.save()

    return EventResponse(
        id=str(event.id),
        title=event.title,
        slug=event.slug,
        description=event.description,
        organization_id=event.organization_id,
        venue_id=event.venue_id,
        category=event.category,
        tags=event.tags,
        start_datetime=event.start_datetime,
        end_datetime=event.end_datetime,
        ticket_tiers=event.ticket_tiers,
        total_capacity=event.total_capacity,
        total_sold=event.total_sold,
        min_price=event.min_price,
        max_price=event.max_price,
        currency=event.currency,
        cover_image=event.cover_image,
        performers=event.performers,
        status=event.status,
        is_featured=event.is_featured,
        view_count=event.view_count,
        created_at=event.created_at
    )


@router.patch("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: str,
    event_update: EventUpdate,
    current_user: User = Depends(get_current_organizer)
):
    """Update event (only organization admins)"""

    event = await Event.get(event_id)

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Verify user owns the organization
    if event.organization_id != current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this event"
        )

    # Update fields
    update_data = event_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)

    # If publishing, set published_at
    if event_update.status == EventStatus.PUBLISHED and not event.published_at:
        event.published_at = datetime.utcnow()

    event.updated_at = datetime.utcnow()
    await event.save()

    return EventResponse(
        id=str(event.id),
        title=event.title,
        slug=event.slug,
        description=event.description,
        organization_id=event.organization_id,
        venue_id=event.venue_id,
        category=event.category,
        tags=event.tags,
        start_datetime=event.start_datetime,
        end_datetime=event.end_datetime,
        ticket_tiers=event.ticket_tiers,
        total_capacity=event.total_capacity,
        total_sold=event.total_sold,
        min_price=event.min_price,
        max_price=event.max_price,
        currency=event.currency,
        cover_image=event.cover_image,
        performers=event.performers,
        status=event.status,
        is_featured=event.is_featured,
        view_count=event.view_count,
        created_at=event.created_at
    )


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: str,
    current_user: User = Depends(get_current_organizer)
):
    """Delete event (only organization admins)"""

    event = await Event.get(event_id)

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Verify user owns the organization
    if event.organization_id != current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this event"
        )

    # Check if event has bookings
    if event.total_sold > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete event with existing bookings. Cancel the event instead."
        )

    await event.delete()
