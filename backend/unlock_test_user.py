"""Unlock test user account."""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def main():
    client = AsyncIOMotorClient(os.getenv("MONGO_URL", "mongodb://localhost:27017"))
    db = client[os.getenv("DB_NAME", "polymath_os")]
    
    result = await db.users.update_one(
        {"email": "test@polymath-os.dev"},
        {"$set": {"failed_login_attempts": 0, "lockout_until": None}}
    )
    
    if result.modified_count > 0:
        print("✅ Test user account UNLOCKED!")
        print("   Failed attempts reset to 0")
        print("   Lockout removed")
        print("\n📝 You can now login with:")
        print("   Email: test@polymath-os.dev")
        print("   Password: TestUser123!")
    else:
        print("❌ User not found or already unlocked")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
