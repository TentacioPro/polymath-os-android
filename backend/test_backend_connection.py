"""
Test backend connectivity and login endpoint directly.
"""
import requests
import json

# Backend URL - update this to match your .env.development
BACKEND_URL = "http://192.168.0.114:8001"

def test_health():
    """Test if backend is reachable."""
    try:
        response = requests.get(f"{BACKEND_URL}/api/health")
        print(f"✅ Health check: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_login():
    """Test login with test user credentials."""
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/auth/login",
            json={
                "email": "test@polymath-os.dev",
                "password": "TestUser123!"
            }
        )
        print(f"\n📝 Login response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login successful!")
            print(f"   Access token (first 50 chars): {data['access_token'][:50]}...")
            print(f"   Token type: {data['token_type']}")
            print(f"   Expires in: {data['expires_in']} seconds")
            return True
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Login request failed: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Testing Backend Connectivity\n")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1️⃣  Health Check:")
    health_ok = test_health()
    
    if not health_ok:
        print("\n⚠️  Backend is not reachable!")
        print("   Solutions:")
        print("   1. Check if backend is running: uvicorn server:app --host 0.0.0.0 --port 8001")
        print("   2. Verify IP address matches: ipconfig")
        print("   3. Check firewall settings")
        exit(1)
    
    # Test 2: Login
    print("\n\n2️⃣  Login Test:")
    login_ok = test_login()
    
    print("\n" + "=" * 50)
    if login_ok:
        print("\n✅ Backend is working correctly!")
        print("   If mobile app still fails, check:")
        print("   1. Frontend .env.development EXPO_PUBLIC_BACKEND_URL")
        print("   2. Network connectivity between device and host")
        print("   3. Expo Go app permissions")
    else:
        print("\n❌ Login test failed!")
        print("   Possible issues:")
        print("   1. User doesn't exist in database")
        print("   2. Password hash mismatch")
        print("   3. Database connection issue")
        print("   4. CORS configuration")
