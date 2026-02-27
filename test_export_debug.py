#!/usr/bin/env python3
"""
Quick test for export JSON issue
"""

import requests
import json
import os

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8001/api")

def test_export_json_debug():
    """Debug the export JSON endpoint issue"""
    print("Testing export JSON with debug...")
    
    try:
        response = requests.post(f"{BACKEND_URL}/export/json")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 500:
            print(f"Error response: {response.text}")
            return False
        else:
            data = response.json()
            print(f"Success: {list(data.keys())}")
            return True
            
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    test_export_json_debug()