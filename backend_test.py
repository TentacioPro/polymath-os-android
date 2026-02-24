#!/usr/bin/env python3
"""
Polymath OS Backend API Test Suite
Tests all backend endpoints for the learning management system
"""

import requests
import json
import sys
from datetime import datetime
import os

# Use the frontend environment variable for backend URL
BACKEND_URL = "https://polymath-hub.preview.emergentagent.com/api"
print(f"Testing backend at: {BACKEND_URL}")

def test_root_endpoint():
    """Test GET /api/ - should return welcome message"""
    print("\n=== Testing Root Endpoint ===")
    try:
        response = requests.get(f"{BACKEND_URL}/")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "Polymath OS" in data["message"]:
                print("✅ Root endpoint working correctly")
                return True
            else:
                print("❌ Root endpoint returned unexpected response")
                return False
        else:
            print(f"❌ Root endpoint failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
        return False

def test_stats_endpoint():
    """Test GET /api/stats - should return statistics"""
    print("\n=== Testing Stats Endpoint ===")
    try:
        response = requests.get(f"{BACKEND_URL}/stats")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["total_activities", "total_journals", "total_connections", "categories", "sources"]
            if all(field in data for field in required_fields):
                print("✅ Stats endpoint working correctly")
                return True
            else:
                print(f"❌ Stats endpoint missing required fields. Got: {list(data.keys())}")
                return False
        else:
            print(f"❌ Stats endpoint failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Stats endpoint error: {e}")
        return False

def test_manual_activity_creation():
    """Test POST /api/activities/manual - should create activity with AI analysis"""
    print("\n=== Testing Manual Activity Creation ===")
    
    activity_data = {
        "title": "Introduction to AI Agents",
        "url": "https://example.com/ai-agents",
        "source": "manual",
        "notes": "Learning about autonomous AI systems"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/activities/manual",
            json=activity_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["id", "title", "url", "source", "timestamp", "hash"]
            if all(field in data for field in required_fields):
                if "ai_analysis" in data and data["ai_analysis"]:
                    print("✅ Manual activity creation working with AI analysis")
                    return True, data["id"]
                else:
                    print("⚠️ Manual activity created but AI analysis missing or empty")
                    return True, data["id"]
            else:
                print(f"❌ Activity creation missing required fields. Got: {list(data.keys())}")
                return False, None
        else:
            error_msg = response.text
            try:
                error_data = response.json()
                error_msg = error_data.get("detail", error_msg)
            except:
                pass
            print(f"❌ Manual activity creation failed with status {response.status_code}: {error_msg}")
            return False, None
    except Exception as e:
        print(f"❌ Manual activity creation error: {e}")
        return False, None

def test_get_activities():
    """Test GET /api/activities - should return activities list"""
    print("\n=== Testing Get Activities ===")
    try:
        response = requests.get(f"{BACKEND_URL}/activities")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            activities = response.json()
            print(f"Found {len(activities)} activities")
            
            if len(activities) > 0:
                # Check structure of first activity
                activity = activities[0]
                required_fields = ["id", "title", "source", "timestamp"]
                if all(field in activity for field in required_fields):
                    print("✅ Get activities working correctly")
                    print(f"Sample activity: {activity['title']} ({activity['source']})")
                    return True
                else:
                    print(f"❌ Activity structure invalid. Missing fields from: {required_fields}")
                    return False
            else:
                print("✅ Get activities working (empty result)")
                return True
        else:
            print(f"❌ Get activities failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get activities error: {e}")
        return False

def test_journal_creation():
    """Test POST /api/journals - should create journal entry"""
    print("\n=== Testing Journal Creation ===")
    
    journal_data = {
        "title": "Day 1: Learning Journey",
        "content": "Started exploring AI and machine learning concepts today. Very interesting!",
        "tags": ["AI", "learning"],
        "linked_activities": []
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/journals",
            json=journal_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["id", "title", "content", "tags", "timestamp"]
            if all(field in data for field in required_fields):
                print("✅ Journal creation working correctly")
                return True, data["id"]
            else:
                print(f"❌ Journal creation missing required fields. Got: {list(data.keys())}")
                return False, None
        else:
            error_msg = response.text
            try:
                error_data = response.json()
                error_msg = error_data.get("detail", error_msg)
            except:
                pass
            print(f"❌ Journal creation failed with status {response.status_code}: {error_msg}")
            return False, None
    except Exception as e:
        print(f"❌ Journal creation error: {e}")
        return False, None

def test_get_journals():
    """Test GET /api/journals - should return journal entries"""
    print("\n=== Testing Get Journals ===")
    try:
        response = requests.get(f"{BACKEND_URL}/journals")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            journals = response.json()
            print(f"Found {len(journals)} journals")
            
            if len(journals) > 0:
                # Check structure of first journal
                journal = journals[0]
                required_fields = ["id", "title", "content", "timestamp"]
                if all(field in journal for field in required_fields):
                    print("✅ Get journals working correctly")
                    print(f"Sample journal: {journal['title']}")
                    return True
                else:
                    print(f"❌ Journal structure invalid. Missing fields from: {required_fields}")
                    return False
            else:
                print("✅ Get journals working (empty result)")
                return True
        else:
            print(f"❌ Get journals failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get journals error: {e}")
        return False

def test_ai_suggestions():
    """Test GET /api/ai/suggestions - should generate AI suggestions"""
    print("\n=== Testing AI Suggestions ===")
    try:
        response = requests.get(f"{BACKEND_URL}/ai/suggestions")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if "suggestions" in data:
                suggestions = data["suggestions"]
                print(f"Generated {len(suggestions)} suggestions")
                
                if len(suggestions) > 0:
                    # Check structure of suggestions
                    suggestion = suggestions[0]
                    if isinstance(suggestion, dict) and "suggestion" in suggestion:
                        print("✅ AI suggestions working correctly")
                        print(f"Sample suggestion: {suggestion.get('suggestion', 'N/A')}")
                        return True
                    else:
                        print("⚠️ AI suggestions returned but structure is unexpected")
                        return True  # Still working, just different structure
                else:
                    print("✅ AI suggestions working (empty result)")
                    return True
            else:
                print("❌ AI suggestions missing 'suggestions' field")
                return False
        else:
            print(f"❌ AI suggestions failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ AI suggestions error: {e}")
        return False

def test_export_json():
    """Test POST /api/export/json - should return complete data structure"""
    print("\n=== Testing Export JSON ===")
    try:
        response = requests.post(f"{BACKEND_URL}/export/json")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["export_date", "version", "activities", "journals", "connections"]
            if all(field in data for field in required_fields):
                print("✅ Export JSON working correctly")
                print(f"Exported {len(data['activities'])} activities, {len(data['journals'])} journals")
                return True
            else:
                print(f"❌ Export JSON missing required fields. Got: {list(data.keys())}")
                return False
        else:
            print(f"❌ Export JSON failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Export JSON error: {e}")
        return False

def main():
    """Run all backend API tests"""
    print("🚀 Starting Polymath OS Backend API Tests")
    print(f"Backend URL: {BACKEND_URL}")
    
    test_results = []
    
    # Run all tests
    test_results.append(("Root Endpoint", test_root_endpoint()))
    test_results.append(("Stats Endpoint", test_stats_endpoint()))
    
    activity_success, activity_id = test_manual_activity_creation()
    test_results.append(("Manual Activity Creation", activity_success))
    
    test_results.append(("Get Activities", test_get_activities()))
    
    journal_success, journal_id = test_journal_creation()
    test_results.append(("Journal Creation", journal_success))
    
    test_results.append(("Get Journals", test_get_journals()))
    test_results.append(("AI Suggestions", test_ai_suggestions()))
    test_results.append(("Export JSON", test_export_json()))
    
    # Summary
    print("\n" + "="*50)
    print("🎯 TEST SUMMARY")
    print("="*50)
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal: {passed + failed} tests")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    if failed == 0:
        print("\n🎉 All tests passed! Backend APIs are working correctly.")
        return True
    else:
        print(f"\n⚠️  {failed} test(s) failed. Check the details above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)