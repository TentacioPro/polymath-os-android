"""
Create a dummy test user for mobile login testing.
This script inserts a test user directly into MongoDB.
"""
import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "polymath_os")

# Password hashing - MUST match auth.py settings (Argon2id)
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
    argon2__time_cost=2,
    argon2__memory_cost=65536,  # 64 MB
    argon2__parallelism=4,
)

def hash_password(password: str) -> str:
    """Hash a password using Argon2id (same as auth.py)."""
    return pwd_context.hash(password)

async def create_test_user():
    """Create a test user in the database."""
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    users_collection = db.users
    
    # Test user credentials
    test_email = "test@polymath-os.dev"
    test_password = "TestUser123!"
    test_display_name = "Test User"
    
    try:
        # Check if user already exists
        existing_user = await users_collection.find_one({"email": test_email.lower()})
        
        if existing_user:
            print(f"✅ Test user already exists: {test_email}")
            print(f"   User ID: {existing_user.get('id')}")
            print(f"   Display Name: {existing_user.get('display_name')}")
            print(f"\n📝 Login credentials:")
            print(f"   Email: {test_email}")
            print(f"   Password: {test_password}")
        else:
            # Create new test user
            user_data = {
                "id": f"test_user_{datetime.utcnow().timestamp()}",
                "email": test_email.lower(),
                "display_name": test_display_name,
                "password_hash": hash_password(test_password),
                "role": "user",
                "is_active": True,
                "failed_login_attempts": 0,
                "lockout_until": None,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Insert user
            result = await users_collection.insert_one(user_data)
            print(f"✅ Test user created successfully!")
            print(f"   User ID: {user_data['id']}")
            print(f"   Email: {test_email}")
            print(f"   Display Name: {test_display_name}")
            print(f"\n📝 Login credentials:")
            print(f"   Email: {test_email}")
            print(f"   Password: {test_password}")
            print(f"\n⚠️  IMPORTANT: Save these credentials securely!")
        
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        raise
    finally:
        client.close()

if __name__ == "__main__":
    print("🔧 Creating test user for Polymath OS mobile login...\n")
    asyncio.run(create_test_user())
