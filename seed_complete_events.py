"""
Seed Complete Event and Venue Data with Seat Layouts
Matches the frontend data structure exactly
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from app.core.config import settings
import json


async def seed_complete_data():
    """Seed venues, events, and seat layouts from JSON data"""

    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]

    print("[SEED] Starting complete data seeding...")

    # Initialize Beanie
    from beanie import init_beanie
    from app.models.venue import Venue, VenueType
    from app.models.event import Event, EventCategory, EventStatus, TicketTier
    from app.models.seat_layout import (
        SeatLayout, LayoutType, SeatSection, Seat, PriceCategory, SeatStatus
    )

    await init_beanie(
        database=db,
        document_models=[Venue, Event, SeatLayout]
    )

    # Data matching frontend structure
    venues_data = [
        {
            "venue_id": "venue_stadium",
            "name": "Stadium",
            "layout_type": "stadium",
            "total_capacity": 334,
            "sections": [
                {"section_name": "North Stand", "total_seats": 76, "base_price": 420},
                {"section_name": "South Stand", "total_seats": 76, "base_price": 420},
                {"section_name": "West Stand", "total_seats": 68, "base_price": 420},
                {"section_name": "East Stand", "total_seats": 68, "base_price": 420},
                {"section_name": "VIP Boxes", "total_seats": 16, "base_price": 840}
            ]
        },
        {
            "venue_id": "venue_open_mic",
            "name": "Open Mic Auditorium",
            "layout_type": "theater",
            "total_capacity": 168,
            "sections": [
                {"section_name": "Front Orchestra", "total_seats": 68, "base_price": 250},
                {"section_name": "Mid Orchestra", "total_seats": 68, "base_price": 200},
                {"section_name": "Balcony", "total_seats": 42, "base_price": 150}
            ]
        },
        {
            "venue_id": "venue_concert_hall",
            "name": "Concert Hall",
            "layout_type": "theater",
            "total_capacity": 374,
            "sections": [
                {"section_name": "Main Gallery", "total_seats": 100, "base_price": 360},
                {"section_name": "Orchestra Front", "total_seats": 60, "base_price": 500}
            ]
        },
        {
            "venue_id": "venue_restaurant",
            "name": "Restaurant Floor",
            "layout_type": "dinner",
            "total_capacity": 28,
            "sections": [
                {"section_name": "Dining Hall", "total_seats": 28, "base_price": 260}
            ]
        },
        {
            "venue_id": "venue_hacklab",
            "name": "Hackathon Arena",
            "layout_type": "custom",
            "total_capacity": 128,
            "sections": [
                {"section_name": "Team Pods", "total_seats": 128, "base_price": 190}
            ]
        },
        {
            "venue_id": "venue_cinema",
            "name": "Cinema Hall",
            "layout_type": "theater",
            "total_capacity": 138,
            "sections": [
                {"section_name": "Premium", "total_seats": 58, "base_price": 300},
                {"section_name": "Standard", "total_seats": 80, "base_price": 200}
            ]
        }
    ]

    events_data = [
        {
            "title": "A Priori: The Chef's Secret Table Experience",
            "slug": "a-priori-chefs-table",
            "description": "An editorial selection of the city's most elusive culinary experiences.",
            "category": "other",
            "start_datetime": "2024-11-24T19:30:00",
            "end_datetime": "2024-11-24T22:00:00",
            "total_capacity": 28,
            "min_price": 245,
            "max_price": 245,
            "currency": "INR",
            "venue_id": "venue_restaurant",
            "is_featured": True,
            "cover_image": "https://images.pexels.com/photos/2085739/pexels-photo-2085739.jpeg"
        },
        {
            "title": "Neon Echoes",
            "slug": "neon-echoes-cinema",
            "description": "Neon Echoes - Drama. 8.4 Rating.",
            "category": "other",
            "start_datetime": "2024-12-01T20:00:00",
            "end_datetime": "2024-12-01T22:30:00",
            "total_capacity": 138,
            "min_price": 200,
            "max_price": 300,
            "currency": "INR",
            "venue_id": "venue_cinema",
            "is_featured": True,
            "cover_image": "https://images.pexels.com/photos/65128/pexels-photo-65128.jpeg"
        },
        {
            "title": "Laughter Therapy - Alex Rivera",
            "slug": "laughter-therapy-comedy",
            "description": "A collection of the city's sharpest wits.",
            "category": "comedy",
            "start_datetime": "2024-12-05T19:00:00",
            "end_datetime": "2024-12-05T21:00:00",
            "total_capacity": 168,
            "min_price": 150,
            "max_price": 250,
            "currency": "INR",
            "venue_id": "venue_open_mic",
            "is_featured": True,
            "cover_image": "https://images.pexels.com/photos/4427157/pexels-photo-4427157.jpeg"
        },
        {
            "title": "Neural Mesh 2024",
            "slug": "neural-mesh-2024-hackathon",
            "description": "Building decentralized inference engines for large scale LLM deployment.",
            "category": "workshop",
            "start_datetime": "2024-12-10T09:00:00",
            "end_datetime": "2024-12-12T18:00:00",
            "total_capacity": 128,
            "min_price": 190,
            "max_price": 250,
            "currency": "INR",
            "venue_id": "venue_hacklab",
            "is_featured": True,
            "cover_image": "https://images.pexels.com/photos/340152/pexels-photo-340152.jpeg"
        },
        {
            "title": "Lia Thorne Acoustic",
            "slug": "lia-thorne-acoustic-open-mic",
            "description": "Raw storytelling through a weathered Gibson.",
            "category": "concert",
            "start_datetime": "2024-12-15T20:00:00",
            "end_datetime": "2024-12-15T22:00:00",
            "total_capacity": 168,
            "min_price": 250,
            "max_price": 350,
            "currency": "INR",
            "venue_id": "venue_open_mic",
            "is_featured": False,
            "cover_image": "https://images.pexels.com/photos/5610237/pexels-photo-5610237.jpeg"
        },
        {
            "title": "IPL 2026 Final - Mumbai vs Chennai",
            "slug": "ipl-2026-stadium-match",
            "description": "Experience the thrill of the IPL finals in our large stadium venue.",
            "category": "sports",
            "start_datetime": "2026-04-25T19:00:00",
            "end_datetime": "2026-04-25T23:30:00",
            "total_capacity": 334,
            "min_price": 420,
            "max_price": 840,
            "currency": "INR",
            "venue_id": "venue_stadium",
            "is_featured": True,
            "cover_image": "https://images.pexels.com/photos/3573024/pexels-photo-3573024.jpeg"
        }
    ]

    # Create venues
    venue_map = {}
    for venue_data in venues_data:
        # Check if venue already exists
        existing_venue = await Venue.find_one({"name": venue_data["name"]})
        if existing_venue:
            venue_map[venue_data["venue_id"]] = existing_venue
            print(f"[OK] Venue already exists: {venue_data['name']}")
            continue

        layout_type_map = {
            "stadium": VenueType.STADIUM,
            "theater": VenueType.THEATER,
            "dinner": VenueType.OTHER,
            "custom": VenueType.CONFERENCE_HALL
        }

        venue = Venue(
            name=venue_data["name"],
            organization_id="PLATFORM",
            city="Mumbai",
            country="India",
            venue_type=layout_type_map.get(venue_data["layout_type"], VenueType.STADIUM),
            capacity=venue_data["total_capacity"],
            address=f"{venue_data['name']}, Mumbai",
            postal_code="400001",
            has_parking=True,
            has_wifi=True,
            has_accessibility=True,
            is_verified=True,
            is_active=True
        )
        await venue.insert()
        venue_map[venue_data["venue_id"]] = venue
        print(f"[OK] Created venue: {venue.name}")

    # Create events with seat layouts
    for event_data in events_data:
        # Check if event already exists
        existing_event = await Event.find_one({"slug": event_data["slug"]})
        if existing_event:
            print(f"[OK] Event already exists: {event_data['title']}")
            continue

        venue = venue_map[event_data["venue_id"]]
        venue_config = next(v for v in venues_data if v["venue_id"] == event_data["venue_id"])

        # Parse datetime
        start_dt = datetime.fromisoformat(event_data["start_datetime"])
        end_dt = datetime.fromisoformat(event_data["end_datetime"])

        # Create ticket tiers from venue sections
        ticket_tiers = []
        for section in venue_config["sections"]:
            tier = TicketTier(
                tier_id=f"tier_{section['section_name'].lower().replace(' ', '_')}",
                tier_name=section["section_name"],
                price=float(section["base_price"]),
                total_quantity=section["total_seats"],
                available_quantity=section["total_seats"],
                min_price=float(section["base_price"]) * 0.8,
                max_price=float(section["base_price"]) * 1.2,
                current_price=float(section["base_price"]),
                perks=[]
            )
            ticket_tiers.append(tier)

        # Map category
        category_map = {
            "dining": EventCategory.OTHER,
            "cinema": EventCategory.OTHER,
            "comedy": EventCategory.COMEDY,
            "hackathons": EventCategory.WORKSHOP,
            "open-mic": EventCategory.CONCERT,
            "sports": EventCategory.SPORTS,
            "workshop": EventCategory.WORKSHOP,
            "concert": EventCategory.CONCERT,
            "other": EventCategory.OTHER
        }

        event = Event(
            title=event_data["title"],
            slug=event_data["slug"],
            description=event_data["description"],
            organization_id=None,
            venue_id=str(venue.id),
            is_platform_event=True,
            category=category_map.get(event_data["category"], EventCategory.OTHER),
            tags=[event_data["category"]],
            start_datetime=start_dt,
            end_datetime=end_dt,
            doors_open=start_dt - timedelta(minutes=30),
            ticket_tiers=ticket_tiers,
            total_capacity=event_data["total_capacity"],
            min_price=float(event_data["min_price"]),
            max_price=float(event_data["max_price"]),
            currency=event_data["currency"],
            cover_image=event_data.get("cover_image"),
            performers=[],
            status=EventStatus.PUBLISHED,
            is_featured=event_data["is_featured"],
            is_public=True,
            enable_dynamic_pricing=True
        )

        await event.insert()
        print(f"[OK] Created event: {event.title}")

        # Create seat layout
        layout_type_map = {
            "stadium": LayoutType.STADIUM,
            "theater": LayoutType.THEATER,
            "dinner": LayoutType.DINNER,
            "custom": LayoutType.CUSTOM
        }

        sections = []
        seats = []
        seat_counter = 0

        for section_data in venue_config["sections"]:
            section_id = f"sec_{section_data['section_name'].lower().replace(' ', '_')}"

            # Determine price category
            if section_data["base_price"] >= 500:
                price_cat = PriceCategory.VIP
            elif section_data["base_price"] >= 300:
                price_cat = PriceCategory.PREMIUM
            elif section_data["base_price"] >= 200:
                price_cat = PriceCategory.STANDARD
            else:
                price_cat = PriceCategory.ECONOMY

            section = SeatSection(
                section_id=section_id,
                section_name=section_data["section_name"],
                section_code=section_data["section_name"][:3].upper(),
                layout_type=layout_type_map[venue_config["layout_type"]],
                total_seats=section_data["total_seats"],
                available_seats=section_data["total_seats"],
                price_category=price_cat,
                base_price=float(section_data["base_price"]),
                color_code="#667eea",
                floor_level=0
            )
            sections.append(section)

            # Generate seats based on layout type
            if venue_config["layout_type"] == "dinner":
                # Table-based seating (4 seats per table)
                num_tables = section_data["total_seats"] // 4
                for table_num in range(1, num_tables + 1):
                    for seat_num in range(1, 5):
                        seat = Seat(
                            row=f"T{table_num}",
                            seat_number=str(seat_num),
                            seat_label=f"Table-{table_num}-Seat-{seat_num}",
                            section_id=section_id,
                            price_category=price_cat,
                            base_price=float(section_data["base_price"]),
                            current_price=float(section_data["base_price"]),
                            status=SeatStatus.AVAILABLE,
                            x_position=seat_num,
                            y_position=table_num
                        )
                        seats.append(seat)
                        seat_counter += 1

            elif venue_config["layout_type"] == "stadium":
                # Stadium seating (rows and columns)
                seats_per_row = 10
                num_rows = (section_data["total_seats"] + seats_per_row - 1) // seats_per_row

                for row_num in range(1, num_rows + 1):
                    for seat_num in range(1, min(seats_per_row + 1, section_data["total_seats"] - (row_num-1)*seats_per_row + 1)):
                        seat = Seat(
                            row=str(row_num),
                            seat_number=str(seat_num),
                            seat_label=f"{section_data['section_name'][:4]}-{row_num}-{seat_num}",
                            section_id=section_id,
                            price_category=price_cat,
                            base_price=float(section_data["base_price"]),
                            current_price=float(section_data["base_price"]),
                            status=SeatStatus.AVAILABLE,
                            is_aisle=(seat_num % 10 == 0),
                            x_position=seat_num,
                            y_position=row_num
                        )
                        seats.append(seat)
                        seat_counter += 1

            else:
                # Theater/Custom seating (traditional rows)
                seats_per_row = 12
                num_rows = (section_data["total_seats"] + seats_per_row - 1) // seats_per_row

                for row_num in range(num_rows):
                    row_letter = chr(65 + row_num)  # A, B, C, D...
                    for seat_num in range(1, min(seats_per_row + 1, section_data["total_seats"] - row_num*seats_per_row + 1)):
                        seat = Seat(
                            row=row_letter,
                            seat_number=str(seat_num),
                            seat_label=f"{row_letter}{seat_num}",
                            section_id=section_id,
                            price_category=price_cat,
                            base_price=float(section_data["base_price"]),
                            current_price=float(section_data["base_price"]),
                            status=SeatStatus.AVAILABLE,
                            is_aisle=(seat_num % 6 == 0),
                            x_position=seat_num,
                            y_position=row_num
                        )
                        seats.append(seat)
                        seat_counter += 1

        # Create seat layout
        seat_layout = SeatLayout(
            event_id=str(event.id),
            venue_id=str(venue.id),
            layout_type=layout_type_map[venue_config["layout_type"]],
            total_capacity=event_data["total_capacity"],
            sections=sections,
            seats=seats,
            enable_realtime_sync=True,
            mqtt_topic=f"event/{event.id}/seats"
        )

        await seat_layout.insert()
        print(f"[OK] Created seat layout with {len(seats)} seats for {event.title}")

    print("\n[OK] Complete data seeding finished!")
    print(f"   - {len(venues_data)} venues")
    print(f"   - {len(events_data)} events with seat layouts")
    print(f"   - Ready for user bookings and Razorpay payments")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed_complete_data())
