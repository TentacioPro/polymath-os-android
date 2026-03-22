"""
Delete test user so we can recreate with correct Argon2 hash.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "polymath_os")

async def delete_test_user():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    result = await db.users.delete_one({"email": "test@polymath-os.dev"})
    
    if result.deleted_count > 0:
        print("✅ Test user deleted successfully!")
        print("   Now run: python create_test_user.py")
    else:
        print("❌ Test user not found (already deleted?)")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(delete_test_user())
