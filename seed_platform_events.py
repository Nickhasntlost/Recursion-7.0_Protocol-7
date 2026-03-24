"""
Seed Platform Events - Events created by platform, not organizations
These are featured/curated events visible to all users
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from app.core.config import settings
from app.models.event import Event, EventCategory, EventStatus, TicketTier
from app.models.seat_layout import (
    SeatLayout, LayoutType, SeatSection, Seat, PriceCategory, SeatStatus
)


async def seed_platform_events():
    """Create platform-curated events with seat layouts"""

    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]

    print("[SEED] Seeding Platform Events...")

    # Initialize Beanie
    from beanie import init_beanie
    from app.models.event import Event
    from app.models.venue import Venue
    from app.models.seat_layout import SeatLayout

    await init_beanie(
        database=db,
        document_models=[Event, Venue, SeatLayout]
    )

    # Get a venue (or create one if doesn't exist)
    from app.models.venue import Venue, VenueType
    venue = await Venue.find_one({"name": "Mumbai Stadium"})

    if not venue:
        venue = Venue(
            name="Mumbai Stadium",
            organization_id="PLATFORM",  # Platform venue
            city="Mumbai",
            country="India",
            venue_type=VenueType.STADIUM,
            capacity=50000,
            address="Andheri Sports Complex, Mumbai",
            postal_code="400053",
            has_parking=True,
            has_wifi=True,
            has_accessibility=True,
            is_verified=True,
            is_active=True
        )
        await venue.insert()
        print(f"[OK] Created venue: {venue.name}")

    # Event 1: IPL Cricket Match (Stadium seating)
    event1_start = datetime.utcnow() + timedelta(days=30)
    event1 = Event(
        title="IPL 2026 Final - Mumbai vs Chennai",
        slug="ipl-2026-final-mumbai-chennai",
        description="Experience the thrill of IPL 2026 Final! Mumbai Indians vs Chennai Super Kings - the ultimate cricket showdown.",
        organization_id=None,  # Platform event
        venue_id=str(venue.id),
        is_platform_event=True,
        category=EventCategory.SPORTS,
        tags=["IPL", "Cricket", "Sports", "Mumbai", "Chennai"],
        start_datetime=event1_start,
        end_datetime=event1_start + timedelta(hours=5),
        doors_open=event1_start - timedelta(hours=2),
        ticket_tiers=[
            TicketTier(
                tier_id="vip-lounge",
                tier_name="VIP Lounge",
                price=15000.0,
                total_quantity=500,
                available_quantity=500,
                min_price=15000.0,
                max_price=20000.0,
                current_price=15000.0,
                perks=["Meet & Greet with Players", "Premium Food & Drinks", "AC Lounge Access"]
            ),
            TicketTier(
                tier_id="premium",
                tier_name="Premium Seats",
                price=5000.0,
                total_quantity=2000,
                available_quantity=2000,
                min_price=4000.0,
                max_price=6000.0,
                current_price=5000.0,
                perks=["Good View", "Comfortable Seating"]
            ),
            TicketTier(
                tier_id="general",
                tier_name="General Admission",
                price=1500.0,
                total_quantity=10000,
                available_quantity=10000,
                min_price=1000.0,
                max_price=2000.0,
                current_price=1500.0,
                perks=[]
            ),
        ],
        total_capacity=12500,
        min_price=1500.0,
        max_price=15000.0,
        currency="INR",
        cover_image="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200",
        performers=["Mumbai Indians", "Chennai Super Kings"],
        status=EventStatus.PUBLISHED,
        is_featured=True,
        is_public=True,
        enable_dynamic_pricing=True
    )

    await event1.insert()
    print(f"[OK] Created event: {event1.title}")

    # Create seat layout for Event 1 (Stadium)
    sections1 = [
        SeatSection(
            section_id="vip-lounge-section",
            section_name="VIP Lounge",
            section_code="VIP",
            layout_type=LayoutType.STADIUM,
            total_seats=500,
            available_seats=500,
            price_category=PriceCategory.VIP,
            base_price=15000.0,
            color_code="#FFD700",
            floor_level=1
        ),
        SeatSection(
            section_id="premium-section",
            section_name="Premium",
            section_code="PREM",
            layout_type=LayoutType.STADIUM,
            total_seats=2000,
            available_seats=2000,
            price_category=PriceCategory.PREMIUM,
            base_price=5000.0,
            color_code="#C0C0C0",
            floor_level=0
        ),
        SeatSection(
            section_id="general-section",
            section_name="General",
            section_code="GEN",
            layout_type=LayoutType.STADIUM,
            total_seats=10000,
            available_seats=10000,
            price_category=PriceCategory.STANDARD,
            base_price=1500.0,
            color_code="#87CEEB",
            floor_level=0
        ),
    ]

    # Generate sample seats for VIP (500 seats)
    seats1 = []
    for row_num in range(1, 11):  # 10 rows
        for seat_num in range(1, 51):  # 50 seats per row
            seats1.append(Seat(
                row=str(row_num),
                seat_number=str(seat_num),
                seat_label=f"VIP-{row_num}-{seat_num}",
                section_id="vip-lounge-section",
                price_category=PriceCategory.VIP,
                base_price=15000.0,
                current_price=15000.0,
                status=SeatStatus.AVAILABLE,
                x_position=seat_num,
                y_position=row_num
            ))

    # Add sample Premium seats (first 100 for demo)
    for row_num in range(1, 6):  # 5 rows
        for seat_num in range(1, 21):  # 20 seats per row
            seats1.append(Seat(
                row=chr(65 + row_num),  # A, B, C, D, E
                seat_number=str(seat_num),
                seat_label=f"{chr(65 + row_num)}-{seat_num}",
                section_id="premium-section",
                price_category=PriceCategory.PREMIUM,
                base_price=5000.0,
                current_price=5000.0,
                status=SeatStatus.AVAILABLE,
                is_aisle=(seat_num % 10 == 0),
                x_position=seat_num,
                y_position=row_num
            ))

    # Add sample General seats (first 50 for demo)
    for row_num in range(1, 3):  # 2 rows
        for seat_num in range(1, 26):  # 25 seats per row
            seats1.append(Seat(
                row=str(row_num + 20),  # Row 21, 22
                seat_number=str(seat_num),
                seat_label=f"G{row_num + 20}-{seat_num}",
                section_id="general-section",
                price_category=PriceCategory.STANDARD,
                base_price=1500.0,
                current_price=1500.0,
                status=SeatStatus.AVAILABLE,
                x_position=seat_num,
                y_position=row_num + 20
            ))

    seat_layout1 = SeatLayout(
        event_id=str(event1.id),
        venue_id=str(venue.id),
        layout_type=LayoutType.STADIUM,
        total_capacity=12500,
        sections=sections1,
        seats=seats1,
        enable_realtime_sync=True,
        mqtt_topic=f"event/{event1.id}/seats"
    )

    await seat_layout1.insert()
    print(f"[OK] Created seat layout with {len(seats1)} sample seats")

    # Event 2: Concert (Theater seating)
    event2_start = datetime.utcnow() + timedelta(days=45)
    event2 = Event(
        title="AR Rahman Live in Concert",
        slug="ar-rahman-live-concert-2026",
        description="Experience the magic of AR Rahman live! An unforgettable evening of music and performance.",
        organization_id=None,
        venue_id=str(venue.id),
        is_platform_event=True,
        category=EventCategory.CONCERT,
        tags=["Concert", "Music", "AR Rahman", "Live Performance"],
        start_datetime=event2_start,
        end_datetime=event2_start + timedelta(hours=4),
        doors_open=event2_start - timedelta(hours=1),
        ticket_tiers=[
            TicketTier(
                tier_id="platinum",
                tier_name="Platinum",
                price=10000.0,
                total_quantity=200,
                available_quantity=200,
                current_price=10000.0,
                perks=["Front Row", "Meet & Greet", "Signed Merchandise"]
            ),
            TicketTier(
                tier_id="gold",
                tier_name="Gold",
                price=5000.0,
                total_quantity=500,
                available_quantity=500,
                current_price=5000.0,
                perks=["Premium Seating", "Free Drinks"]
            ),
            TicketTier(
                tier_id="silver",
                tier_name="Silver",
                price=2500.0,
                total_quantity=1000,
                available_quantity=1000,
                current_price=2500.0,
                perks=[]
            ),
        ],
        total_capacity=1700,
        min_price=2500.0,
        max_price=10000.0,
        currency="INR",
        cover_image="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200",
        performers=["AR Rahman"],
        status=EventStatus.PUBLISHED,
        is_featured=True,
        is_public=True,
        enable_dynamic_pricing=True
    )

    await event2.insert()
    print(f"[OK] Created event: {event2.title}")

    # Create simple seat layout for Event 2 (Theater)
    sections2 = [
        SeatSection(
            section_id="platinum-section",
            section_name="Platinum",
            section_code="PLAT",
            layout_type=LayoutType.THEATER,
            total_seats=200,
            available_seats=200,
            price_category=PriceCategory.VIP,
            base_price=10000.0,
            color_code="#E5E4E2",
            floor_level=0
        ),
        SeatSection(
            section_id="gold-section",
            section_name="Gold",
            section_code="GOLD",
            layout_type=LayoutType.THEATER,
            total_seats=500,
            available_seats=500,
            price_category=PriceCategory.PREMIUM,
            base_price=5000.0,
            color_code="#FFD700",
            floor_level=0
        ),
        SeatSection(
            section_id="silver-section",
            section_name="Silver",
            section_code="SILV",
            layout_type=LayoutType.THEATER,
            total_seats=1000,
            available_seats=1000,
            price_category=PriceCategory.STANDARD,
            base_price=2500.0,
            color_code="#C0C0C0",
            floor_level=1
        ),
    ]

    seats2 = []
    # Generate Platinum seats (first 50 for demo)
    for row_num in range(1, 6):
        for seat_num in range(1, 11):
            seats2.append(Seat(
                row=chr(64 + row_num),  # A, B, C, D, E
                seat_number=str(seat_num),
                seat_label=f"{chr(64 + row_num)}{seat_num}",
                section_id="platinum-section",
                price_category=PriceCategory.VIP,
                base_price=10000.0,
                current_price=10000.0,
                status=SeatStatus.AVAILABLE,
                x_position=seat_num,
                y_position=row_num
            ))

    seat_layout2 = SeatLayout(
        event_id=str(event2.id),
        venue_id=str(venue.id),
        layout_type=LayoutType.THEATER,
        total_capacity=1700,
        sections=sections2,
        seats=seats2,
        enable_realtime_sync=True,
        mqtt_topic=f"event/{event2.id}/seats"
    )

    await seat_layout2.insert()
    print(f"[OK] Created seat layout with {len(seats2)} sample seats")

    print("\n[OK] Platform events seeded successfully!")
    print(f"   - {event1.title} (Stadium layout)")
    print(f"   - {event2.title} (Theater layout)")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed_platform_events())
