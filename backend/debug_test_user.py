"""
Debug test user - check and fix password hash.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "polymath_os")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def debug_test_user():
    """Check test user and verify password."""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    users_collection = db.users
    
    test_email = "test@polymath-os.dev"
    
    # Find user
    user = await users_collection.find_one({"email": test_email.lower()})
    
    if not user:
        print(f"❌ Test user not found in database!")
        print(f"   Run create_test_user.py first.")
        return
    
    print(f"✅ Test user found:")
    print(f"   ID: {user['id']}")
    print(f"   Email: {user['email']}")
    print(f"   Display Name: {user.get('display_name', 'N/A')}")
    print(f"   Is Active: {user.get('is_active', False)}")
    print(f"   Password Hash: {user['password_hash'][:50]}...")
    
    # Test password verification
    test_password = "TestUser123!"
    print(f"\n🔐 Testing password verification...")
    
    try:
        is_valid = pwd_context.verify(test_password, user['password_hash'])
        if is_valid:
            print(f"   ✅ Password matches hash!")
        else:
            print(f"   ❌ Password DOES NOT match hash!")
            print(f"\n💡 Solution: Recreate user with correct hash")
            
            # Fix: Update password hash
            print(f"\n🔧 Updating password hash...")
            new_hash = pwd_context.hash(test_password)
            await users_collection.update_one(
                {"email": test_email.lower()},
                {"$set": {"password_hash": new_hash}}
            )
            print(f"   ✅ Password hash updated!")
            
            # Verify again
            user_updated = await users_collection.find_one({"email": test_email.lower()})
            is_valid_again = pwd_context.verify(test_password, user_updated['password_hash'])
            print(f"   Re-verification: {'✅ PASS' if is_valid_again else '❌ FAIL'}")
    except Exception as e:
        print(f"   ❌ Error during verification: {e}")
        print(f"   This might be a bcrypt version incompatibility.")
        
        # Alternative fix: Create new hash using same method as server.py
        print(f"\n💡 Trying alternative hash creation...")
        try:
            # Import the actual hash function from server.py
            import sys
            sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
            from server import hash_password
            
            new_hash = hash_password(test_password)
            await users_collection.update_one(
                {"email": test_email.lower()},
                {"$set": {"password_hash": new_hash}}
            )
            print(f"   ✅ Updated hash using server.py hash_password function!")
            
            # Verify
            user_updated = await users_collection.find_one({"email": test_email.lower()})
            # Try to verify using server's verify function
            from server import verify_password
            is_valid = verify_password(test_password, user_updated['password_hash'])
            print(f"   Re-verification with server functions: {'✅ PASS' if is_valid else '❌ FAIL'}")
            
        except Exception as e2:
            print(f"   ❌ Alternative fix also failed: {e2}")
    
    client.close()

if __name__ == "__main__":
    print("🔍 Debugging Test User\n")
    print("=" * 50)
    asyncio.run(debug_test_user())
    print("=" * 50)
