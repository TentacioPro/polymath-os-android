"""Check test user in database and verify password."""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from auth import verify_password

load_dotenv()

async def main():
    client = AsyncIOMotorClient(os.getenv("MONGO_URL", "mongodb://localhost:27017"))
    db = client[os.getenv("DB_NAME", "polymath_os")]
    
    # Find test user
    user = await db.users.find_one({"email": "test@polymath-os.dev"})
    
    if not user:
        print("❌ Test user NOT FOUND in database!")
        return
    
    print("✅ Test User Found:")
    print(f"   Email: {user['email']}")
    print(f"   Display Name: {user.get('display_name', 'N/A')}")
    print(f"   Is Active: {user.get('is_active', False)}")
    print(f"   Password Hash: {user['password_hash'][:80]}...")
    
    # Test password
    test_password = "TestUser123!"
    is_valid = verify_password(test_password, user['password_hash'])
    
    print(f"\n🔐 Password Verification Test:")
    print(f"   Input: '{test_password}'")
    print(f"   Result: {'✅ VALID' if is_valid else '❌ INVALID'}")
    
    if not is_valid:
        print("\n⚠️  PASSWORD MISMATCH - Need to fix hash!")
        from auth import hash_password
        new_hash = hash_password(test_password)
        await db.users.update_one(
            {"email": "test@polymath-os.dev"},
            {"$set": {"password_hash": new_hash}}
        )
        print("✅ Updated password hash with fresh Argon2 hash")
        
        # Verify again
        user2 = await db.users.find_one({"email": "test@polymath-os.dev"})
        is_valid2 = verify_password(test_password, user2['password_hash'])
        print(f"   Re-test: {'✅ VALID' if is_valid2 else '❌ INVALID'}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
