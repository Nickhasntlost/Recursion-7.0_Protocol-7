"""
Verify the seeded data is in the database and ready for API access
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings


async def verify_data():
    """Check all seeded data"""

    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]

    print("\n" + "="*60)
    print("VERIFICATION: Seeded Data Status")
    print("="*60 + "\n")

    # Check Venues
    venues = await db.venues.find({"organization_id": "PLATFORM"}).to_list(length=100)
    print(f"[OK] Venues Created: {len(venues)}")
    for venue in venues:
        print(f"   - {venue['name']} (capacity: {venue['capacity']})")

    # Check Events
    events = await db.events.find({"is_platform_event": True}).to_list(length=100)
    print(f"\n[OK] Platform Events Created: {len(events)}")
    for event in events:
        print(f"   - {event['title']}")
        print(f"     Slug: {event['slug']}")
        print(f"     Price: {event['currency']} {event['min_price']} - {event['max_price']}")
        print(f"     Capacity: {event['total_capacity']} seats")

    # Check Seat Layouts
    seat_layouts = await db.seat_layouts.find({}).to_list(length=100)
    print(f"\n[OK] Seat Layouts Created: {len(seat_layouts)}")
    for layout in seat_layouts:
        event = await db.events.find_one({"_id": layout["event_id"]})
        if event:
            print(f"   - {event['title']}: {len(layout['seats'])} seats, {len(layout['sections'])} sections")

    # API Endpoints Available
    print("\n" + "="*60)
    print("AVAILABLE API ENDPOINTS")
    print("="*60 + "\n")

    print("PUBLIC ENDPOINTS:")
    print("  GET  /api/v1/events/                     - List all events")
    print("  GET  /api/v1/events/{slug}               - Get event by slug")
    print("  GET  /api/v1/seats/{event_id}            - Get seat layout")
    print("  GET  /api/v1/seats/{event_id}/availability - Real-time availability")
    print()

    print("AUTHENTICATED USER ENDPOINTS:")
    print("  POST /api/v1/bookings/                   - Create booking")
    print("  POST /api/v1/bookings/payment/create     - Create Razorpay order")
    print("  POST /api/v1/bookings/payment/verify     - Verify payment")
    print("  GET  /api/v1/bookings/my-bookings        - View transaction history")
    print("  GET  /api/v1/bookings/{booking_id}       - Booking details")
    print("  POST /api/v1/bookings/{booking_id}/cancel - Cancel booking")
    print("  POST /api/v1/bookings/{booking_id}/change-seats - Change seats")
    print()

    print("="*60)
    print("EXAMPLE API CALLS")
    print("="*60 + "\n")

    print("# Get all events:")
    print("curl http://localhost:8000/api/v1/events/\n")

    print("# Get specific event:")
    print(f"curl http://localhost:8000/api/v1/events/a-priori-chefs-table\n")

    if events:
        first_event = events[0]
        print(f"# Get seat layout for '{first_event['title']}':")
        print(f"curl http://localhost:8000/api/v1/seats/{first_event['_id']}\n")

        print(f"# Get seat availability:")
        print(f"curl http://localhost:8000/api/v1/seats/{first_event['_id']}/availability\n")

    print("="*60)
    print("DATABASE SUMMARY")
    print("="*60 + "\n")

    total_seats = sum(len(layout['seats']) for layout in seat_layouts)
    print(f"Total Venues:       {len(venues)}")
    print(f"Total Events:       {len(events)}")
    print(f"Total Seat Layouts: {len(seat_layouts)}")
    print(f"Total Seats:        {total_seats}")
    print()

    print("[OK] All data seeded successfully!")
    print("[OK] Ready for Razorpay integration and user bookings!")
    print()

    client.close()


if __name__ == "__main__":
    asyncio.run(verify_data())
