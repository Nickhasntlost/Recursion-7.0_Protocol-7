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
    
    # Clear existing venues to avoid duplicates during repeated seeding
    await Venue.find_all().delete()
    print("Cleared existing venues collection.")

    # Sample venues with images
    venues_data = [
        {
            "name": "Jio World Convention Centre",
            "organization_id": "org_assemble_1",
            "address": "G Block, Bandra Kurla Complex",
            "city": "Mumbai",
            "state": "Maharashtra",
            "country": "India",
            "postal_code": "400098",
            "venue_type": VenueType.CONFERENCE_HALL,
            "description": "India's foremost destination for conventions, exhibitions, and corporate events. Features majestic ballrooms and world-class tech setup.",
            "capacity": 5000,
            "images": [
                "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
                "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800",
                "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
            ],
            "amenities": [
                {"name": "5G High-speed WiFi", "icon": "📶"},
                {"name": "Premium AV Equipment", "icon": "🎤"},
                {"name": "Gourmet Catering", "icon": "🍽️"},
            ],
            "has_parking": True,
            "has_wifi": True,
            "has_accessibility": True,
            "is_active": True,
            "is_verified": True,
        },
        {
            "name": "The Piano Man Jazz Club",
            "organization_id": "org_assemble_2",
            "address": "Commercial Complex B 6/7-22, Safdarjung Enclave",
            "city": "New Delhi",
            "state": "Delhi",
            "country": "India",
            "postal_code": "110029",
            "venue_type": VenueType.CONCERT_HALL,
            "description": "Delhi's iconic jazz club offering intimate live music experiences with exceptional acoustics and a curated menu.",
            "capacity": 150,
            "images": [
                "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800",
                "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
                "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
            ],
            "amenities": [
                {"name": "Acoustically Treated", "icon": "🔊"},
                {"name": "Signature Cocktails", "icon": "🍸"},
                {"name": "Stage Lighting", "icon": "💡"},
            ],
            "has_parking": True,
            "has_wifi": True,
            "has_accessibility": False,
            "is_active": True,
            "is_verified": True,
        },
        {
            "name": "DY Patil Stadium",
            "organization_id": "org_assemble_3",
            "address": "Sector 7, Nerul",
            "city": "Navi Mumbai",
            "state": "Maharashtra",
            "country": "India",
            "postal_code": "400706",
            "venue_type": VenueType.ARENA,
            "description": "Massive sports and entertainment arena. Hosted Justin Bieber, U2, and IPL finals. Features world-class facilities and giant screens.",
            "capacity": 55000,
            "images": [
                "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
                "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800",
                "https://images.unsplash.com/photo-1519167758481-83f29da8c2aa?w=800",
            ],
            "amenities": [
                {"name": "Giant LED Screens", "icon": "📺"},
                {"name": "VIP Corporate Boxes", "icon": "👑"},
                {"name": "Food Courts", "icon": "🍔"},
            ],
            "has_parking": True,
            "has_wifi": True,
            "has_accessibility": True,
            "is_active": True,
            "is_verified": True,
        },
        {
            "name": "NCPA - Jamshed Bhabha Theatre",
            "organization_id": "org_assemble_4",
            "address": "NCPA Marg, Nariman Point",
            "city": "Mumbai",
            "state": "Maharashtra",
            "country": "India",
            "postal_code": "400021",
            "venue_type": VenueType.THEATER,
            "description": "India's premier cultural institution. Features historic architecture, majestic opera seating, and perfect acoustics for theater and ballet.",
            "capacity": 1109,
            "images": [
                "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800",
                "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",
                "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800",
            ],
            "amenities": [
                {"name": "Historic Architecture", "icon": "🏛️"},
                {"name": "Dressing Rooms", "icon": "🎭"},
                {"name": "Grand Foyer", "icon": "✨"},
            ],
            "has_parking": True,
            "has_wifi": True,
            "has_accessibility": True,
            "is_active": True,
            "is_verified": True,
        },
        {
            "name": "Echoes of Earth Festival Grounds",
            "organization_id": "org_assemble_5",
            "address": "Embassy International Riding School",
            "city": "Bengaluru",
            "state": "Karnataka",
            "country": "India",
            "postal_code": "562157",
            "venue_type": VenueType.OUTDOOR,
            "description": "Lush green outdoor venue perfect for eco-friendly music festivals and massive outdoor gatherings under the stars.",
            "capacity": 15000,
            "images": [
                "https://images.unsplash.com/photo-1519167758481-83f29da8c2aa?w=800",
                "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
                "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
            ],
            "amenities": [
                {"name": "Lush Green Lawns", "icon": "🌴"},
                {"name": "Flea Market Setup", "icon": "⛺"},
                {"name": "Multiple Stages", "icon": "🎪"},
            ],
            "has_parking": True,
            "has_wifi": False,
            "has_accessibility": True,
            "is_active": True,
            "is_verified": True,
        },
        {
            "name": "ITC Maurya Grand Banquet",
            "organization_id": "org_assemble_6",
            "address": "Diplomatic Enclave, Sardar Patel Marg",
            "city": "New Delhi",
            "state": "Delhi",
            "country": "India",
            "postal_code": "110021",
            "venue_type": VenueType.OTHER,
            "description": "Luxury dining and banquet hall. Iconic destination for premium culinary events, food tasting festivals, and grand gala dinners. Home to world-renowned chefs.",
            "capacity": 400,
            "images": [
                "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
                "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800",
                "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800",
            ],
            "amenities": [
                {"name": "Master Chef Catering", "icon": "🍽️"},
                {"name": "Luxury Seating", "icon": "🛋️"},
                {"name": "Valet Parking", "icon": "🚗"},
            ],
            "has_parking": True,
            "has_wifi": True,
            "has_accessibility": True,
            "is_active": True,
            "is_verified": True,
        },
        {
            "name": "The Habitat",
            "organization_id": "org_assemble_7",
            "address": "1st Floor, OYO Townhouse, Khar West",
            "city": "Mumbai",
            "state": "Maharashtra",
            "country": "India",
            "postal_code": "400052",
            "venue_type": VenueType.AUDITORIUM,
            "description": "Mumbai's premier comedy and open mic venue. A cozy, acoustically perfect auditorium that hosts the tightest stand-up sets and indie music nights.",
            "capacity": 120,
            "images": [
                "https://images.unsplash.com/photo-1516280440502-132d73ce1856?w=800",
                "https://images.unsplash.com/photo-1525926472898-0c67da7a13bd?w=800",
                "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800",
            ],
            "amenities": [
                {"name": "Stand-up Stage", "icon": "🎙️"},
                {"name": "Cafe Area", "icon": "☕"},
                {"name": "Intimate Seating", "icon": "🪑"},
            ],
            "has_parking": False,
            "has_wifi": True,
            "has_accessibility": True,
            "is_active": True,
            "is_verified": True,
        },
        {
            "name": "PVR Director's Cut",
            "organization_id": "org_assemble_8",
            "address": "Ambience Mall, Vasant Kunj",
            "city": "New Delhi",
            "state": "Delhi",
            "country": "India",
            "postal_code": "110070",
            "venue_type": VenueType.THEATER,
            "description": "The peak of luxury cinema. Screening classic movies and independent film festivals. Features recliner seats, in-theater dining, and laser projection.",
            "capacity": 250,
            "images": [
                "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",
                "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800",
                "https://images.unsplash.com/photo-1595769816263-95ba422db740?w=800",
            ],
            "amenities": [
                {"name": "Dolby Atmos", "icon": "🔊"},
                {"name": "Gourmet Menu", "icon": "🍿"},
                {"name": "Recliner Seats", "icon": "🛋️"},
            ],
            "has_parking": True,
            "has_wifi": True,
            "has_accessibility": True,
            "is_active": True,
            "is_verified": True,
        },
        {
            "name": "NESCO Center",
            "organization_id": "org_assemble_9",
            "address": "Western Express Highway, Goregaon East",
            "city": "Mumbai",
            "state": "Maharashtra",
            "country": "India",
            "postal_code": "400063",
            "venue_type": VenueType.CONCERT_HALL,
            "description": "Mumbai's biggest indoor concert and exhibition venue. Frequently hosts international DJs, major live music festivals, and global conventions.",
            "capacity": 15000,
            "images": [
                "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
                "https://images.unsplash.com/photo-1540039155732-6761b34ea7bf?w=800",
                "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
            ],
            "amenities": [
                {"name": "Massive Stage Setup", "icon": "🎸"},
                {"name": "VIP Lounges", "icon": "👑"},
                {"name": "Advanced Rigging", "icon": "🏗️"},
            ],
            "has_parking": True,
            "has_wifi": True,
            "has_accessibility": True,
            "is_active": True,
            "is_verified": True,
        },
        {
            "name": "Wankhede Stadium",
            "organization_id": "org_assemble_10",
            "address": "D Road, Churchgate",
            "city": "Mumbai",
            "state": "Maharashtra",
            "country": "India",
            "postal_code": "400020",
            "venue_type": VenueType.STADIUM,
            "description": "An iconic international cricket stadium situated right by the sea. Perfect for legendary sports matches and massive outdoor amphitheater events.",
            "capacity": 33108,
            "images": [
                "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
                "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800",
                "https://images.unsplash.com/photo-1518091043644-c1d44570d221?w=800",
            ],
            "amenities": [
                {"name": "Floodlights", "icon": "💡"},
                {"name": "Multiple Gates", "icon": "🚪"},
                {"name": "Food Concessions", "icon": "🍔"},
            ],
            "has_parking": True,
            "has_wifi": False,
            "has_accessibility": True,
            "is_active": True,
            "is_verified": True,
        },
        {
            "name": "T-Hub Phase 2",
            "organization_id": "org_assemble_11",
            "address": "Knowledge City, HITEC City",
            "city": "Hyderabad",
            "state": "Telangana",
            "country": "India",
            "postal_code": "500081",
            "venue_type": VenueType.CONFERENCE_HALL,
            "description": "The world's largest innovation campus. A sprawling modern facility perfect for 48-hour hackathons, tech summits, and developer conferences.",
            "capacity": 4000,
            "images": [
                "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
                "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
                "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800",
            ],
            "amenities": [
                {"name": "24/7 Power Backup", "icon": "⚡"},
                {"name": "Breakout Pods", "icon": "🛋️"},
                {"name": "Ultra-fast WiFi", "icon": "🌐"},
            ],
            "has_parking": True,
            "has_wifi": True,
            "has_accessibility": True,
            "is_active": True,
            "is_verified": True,
        }
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
