"""
Seed sample venues to MongoDB for AI venue suggestions
Run: python seed_venues.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.venue import Venue, VenueType, Amenity
from app.core.config import settings


async def seed_venues():
    """Add sample venues to database for testing AI suggestions"""

    # Connect to MongoDB and initialize Beanie
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]

    await init_beanie(
        database=db,
        document_models=[Venue]
    )

    # Sample venues with images
    venues_data = [
        {
            "name": "Grand Conference Center",
            "organization_id": "org_sample_1",
            "address": "123 Business District",
            "city": "Los Angeles",
            "state": "California",
            "country": "USA",
            "postal_code": "90001",
            "venue_type": VenueType.CONFERENCE_HALL,
            "description": "Modern conference center with state-of-the-art AV equipment and breakout rooms. Perfect for corporate events, tech conferences, and business meetings.",
            "capacity": 500,
            "images": [
                "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",  # Conference hall
                "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800",  # Meeting room
                "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",  # Stage
            ],
            "amenities": [
                {"name": "High-speed WiFi", "icon": "📶"},
                {"name": "AV Equipment", "icon": "🎤"},
                {"name": "Catering Service", "icon": "🍽️"},
            ],
            "has_parking": True,
            "has_wifi": True,
            "has_accessibility": True,
            "is_active": True,
            "is_verified": True,
        },
        {
            "name": "Sunset Concert Hall",
            "organization_id": "org_sample_2",
            "address": "456 Music Avenue",
            "city": "Los Angeles",
            "state": "California",
            "country": "USA",
            "postal_code": "90028",
            "venue_type": VenueType.CONCERT_HALL,
            "description": "Iconic concert venue with world-class acoustics. Hosted legendary performances. Features premium sound system and VIP boxes.",
            "capacity": 2000,
            "images": [
                "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800",  # Concert stage
                "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",  # Audience view
                "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",  # Stage lights
            ],
            "amenities": [
                {"name": "Premium Sound System", "icon": "🔊"},
                {"name": "VIP Boxes", "icon": "👑"},
                {"name": "Bar & Lounge", "icon": "🍸"},
            ],
            "has_parking": True,
            "has_wifi": True,
            "has_accessibility": True,
            "is_active": True,
            "is_verified": True,
        },
        {
            "name": "Tech Hub Arena",
            "organization_id": "org_sample_3",
            "address": "789 Innovation Blvd",
            "city": "San Francisco",
            "state": "California",
            "country": "USA",
            "postal_code": "94103",
            "venue_type": VenueType.ARENA,
            "description": "Massive tech event space with flexible layout. Perfect for hackathons, product launches, and tech expos. Fiber optic internet throughout.",
            "capacity": 3000,
            "images": [
                "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",  # Large venue
                "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800",  # Tech setup
                "https://images.unsplash.com/photo-1519167758481-83f29da8c2aa?w=800",  # Event space
            ],
            "amenities": [
                {"name": "Fiber Optic Internet", "icon": "⚡"},
                {"name": "LED Walls", "icon": "📺"},
                {"name": "Power Outlets Everywhere", "icon": "🔌"},
            ],
            "has_parking": True,
            "has_wifi": True,
            "has_accessibility": True,
            "is_active": True,
            "is_verified": True,
        },
        {
            "name": "Riverside Theater",
            "organization_id": "org_sample_4",
            "address": "321 Arts District",
            "city": "New York",
            "state": "New York",
            "country": "USA",
            "postal_code": "10013",
            "venue_type": VenueType.THEATER,
            "description": "Historic theater with beautiful architecture. Ideal for plays, comedy shows, and intimate performances. Recently renovated with modern amenities.",
            "capacity": 800,
            "images": [
                "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800",  # Theater interior
                "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",  # Stage
                "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800",  # Seating
            ],
            "amenities": [
                {"name": "Historic Architecture", "icon": "🏛️"},
                {"name": "Professional Lighting", "icon": "💡"},
                {"name": "Dressing Rooms", "icon": "🎭"},
            ],
            "has_parking": False,
            "has_wifi": True,
            "has_accessibility": True,
            "is_active": True,
            "is_verified": True,
        },
        {
            "name": "Garden Pavilion",
            "organization_id": "org_sample_5",
            "address": "555 Park Lane",
            "city": "Miami",
            "state": "Florida",
            "country": "USA",
            "postal_code": "33101",
            "venue_type": VenueType.OUTDOOR,
            "description": "Beautiful outdoor venue surrounded by tropical gardens. Perfect for weddings, festivals, and outdoor concerts. Weather-protected tents available.",
            "capacity": 1200,
            "images": [
                "https://images.unsplash.com/photo-1519167758481-83f29da8c2aa?w=800",  # Outdoor setup
                "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",  # Garden
                "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",  # Event space
            ],
            "amenities": [
                {"name": "Tropical Gardens", "icon": "🌴"},
                {"name": "Weather Tents", "icon": "⛺"},
                {"name": "Outdoor Stage", "icon": "🎪"},
            ],
            "has_parking": True,
            "has_wifi": False,
            "has_accessibility": True,
            "is_active": True,
            "is_verified": True,
        },
    ]

    # Insert venues
    print("Seeding venues to MongoDB...")
    for venue_data in venues_data:
        # Convert amenities dict to Amenity model
        venue_data["amenities"] = [Amenity(**a) for a in venue_data["amenities"]]

        venue = Venue(**venue_data)
        await venue.insert()
        print(f"   Added: {venue.name} ({venue.city}) - Capacity: {venue.capacity}")

    print(f"\nSuccessfully seeded {len(venues_data)} venues!")
    print("Venues are indexed by: city, capacity, venue_type, is_active")
    print("AI can now suggest venues with images based on event requirements!\n")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed_venues())
