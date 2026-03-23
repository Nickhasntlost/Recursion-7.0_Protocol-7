from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from typing import Optional


class Database:
    client: Optional[AsyncIOMotorClient] = None


db = Database()


async def connect_to_mongo():
    """Connect to MongoDB and initialize Beanie ODM"""
    db.client = AsyncIOMotorClient(settings.MONGODB_URL)

    # Import all models here
    from app.models.user import User
    from app.models.organization import Organization
    from app.models.event import Event
    from app.models.booking import Booking
    from app.models.venue import Venue
    from app.models.volunteer import Volunteer
    from app.models.task import Task
    from app.models.chat import Message
    from app.models.ai_conversation import AIConversation

    await init_beanie(
        database=db.client[settings.DATABASE_NAME],
        document_models=[
            User,
            Organization,
            Event,
            Booking,
            Venue,
            Volunteer,
            Task,
            Message,
            AIConversation,
        ]
    )
    print("✅ Connected to MongoDB and initialized Beanie")


async def close_mongo_connection():
    """Close MongoDB connection"""
    if db.client:
        db.client.close()
        print("❌ Closed MongoDB connection")
