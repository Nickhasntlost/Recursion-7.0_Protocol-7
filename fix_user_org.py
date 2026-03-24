"""
Quick script to fix user organization_id mismatch
Run: python fix_user_org.py
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from app.core.config import settings


async def fix_user_organization():
    # Connect to MongoDB
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]

    # User details - CONVERT TO ObjectId
    user_id = ObjectId("69c11be63de68676d78ad62a")
    correct_org_id = "69c1b80ac609265ece3fc61e"

    print(f"Looking for user: {user_id}")

    # Check if user exists
    user = await db.users.find_one({"_id": user_id})
    if not user:
        print("❌ User not found!")
        client.close()
        return

    print(f"✅ User found: {user.get('email')}")
    print(f"   Current organization_id: {user.get('organization_id')}")
    print(f"   Will update to: {correct_org_id}")

    # Update user's organization_id
    result = await db.users.update_one(
        {"_id": user_id},
        {"$set": {"organization_id": correct_org_id}}
    )

    if result.modified_count > 0:
        print(f"\n✅ FIXED! User organization_id updated to: {correct_org_id}")
    else:
        print("\n⚠️ No changes made (maybe already correct?)")

    # Verify
    user = await db.users.find_one({"_id": user_id})
    if user:
        print(f"\n📊 Verified - Current user organization_id: {user.get('organization_id')}")

    client.close()


if __name__ == "__main__":
    asyncio.run(fix_user_organization())
