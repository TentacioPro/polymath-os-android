#!/usr/bin/env python3
"""
Backend API Testing for Polymath OS - Agent Memory System
Testing the NEW Agent Memory System endpoints
"""

import requests
import json
import sys
from datetime import datetime
import time

# Backend URL from environment
BASE_URL = "https://polymath-hub.preview.emergentagent.com/api"

class AgentMemoryTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.persona_id = None
        self.memory_ids = []
        
    def log_result(self, test_name, success, message="", details=""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details,
            "timestamp": datetime.utcnow().isoformat()
        }
        self.test_results.append(result)
        print(f"{status} {test_name}: {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_agent_stats(self):
        """Test GET /api/agent/stats"""
        try:
            response = self.session.get(f"{BASE_URL}/agent/stats")
            
            if response.status_code != 200:
                self.log_result("Agent Stats API", False, f"HTTP {response.status_code}", response.text)
                return False
            
            data = response.json()
            
            # Validate response structure
            required_fields = ["total_memories", "breakdown", "total_learning_events"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                self.log_result("Agent Stats API", False, f"Missing fields: {missing_fields}", str(data))
                return False
            
            # Check breakdown structure
            breakdown = data.get("breakdown", {})
            breakdown_fields = ["short_term", "long_term", "insights", "patterns"]
            missing_breakdown = [field for field in breakdown_fields if field not in breakdown]
            
            if missing_breakdown:
                self.log_result("Agent Stats API", False, f"Missing breakdown fields: {missing_breakdown}")
                return False
            
            self.log_result("Agent Stats API", True, 
                          f"Total memories: {data['total_memories']}, Learning events: {data['total_learning_events']}")
            return True
            
        except Exception as e:
            self.log_result("Agent Stats API", False, f"Exception: {str(e)}")
            return False
    
    def test_agent_persona_get(self):
        """Test GET /api/agent/persona"""
        try:
            response = self.session.get(f"{BASE_URL}/agent/persona")
            
            if response.status_code != 200:
                self.log_result("Get Agent Persona", False, f"HTTP {response.status_code}", response.text)
                return False
            
            data = response.json()
            
            # Validate persona structure
            required_fields = ["name", "role", "focus_areas", "behavior_traits", "custom_instructions"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                self.log_result("Get Agent Persona", False, f"Missing fields: {missing_fields}")
                return False
            
            # Store persona ID for later tests
            if "id" in data:
                self.persona_id = data["id"]
            
            self.log_result("Get Agent Persona", True, 
                          f"Name: {data['name']}, Role: {data['role']}")
            return True
            
        except Exception as e:
            self.log_result("Get Agent Persona", False, f"Exception: {str(e)}")
            return False
    
    def test_agent_memory_get_initial(self):
        """Test GET /api/agent/memory (initial - may be empty)"""
        try:
            response = self.session.get(f"{BASE_URL}/agent/memory?limit=20")
            
            if response.status_code != 200:
                self.log_result("Get Agent Memories (Initial)", False, f"HTTP {response.status_code}", response.text)
                return False
            
            data = response.json()
            
            if not isinstance(data, list):
                self.log_result("Get Agent Memories (Initial)", False, "Response not an array", str(data))
                return False
            
            self.log_result("Get Agent Memories (Initial)", True, 
                          f"Retrieved {len(data)} initial memories")
            return True
            
        except Exception as e:
            self.log_result("Get Agent Memories (Initial)", False, f"Exception: {str(e)}")
            return False
    
    def test_agent_learn(self):
        """Test POST /api/agent/learn"""
        try:
            response = self.session.post(f"{BASE_URL}/agent/learn")
            
            if response.status_code != 200:
                self.log_result("Agent Learning Trigger", False, f"HTTP {response.status_code}", response.text)
                return False
            
            data = response.json()
            
            # Validate response structure
            required_fields = ["insights_extracted", "memories_created"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                self.log_result("Agent Learning Trigger", False, f"Missing fields: {missing_fields}")
                return False
            
            insights = data["insights_extracted"]
            memories = data["memories_created"]
            journals_processed = data.get("journals_processed", 0)
            
            self.log_result("Agent Learning Trigger", True, 
                          f"Extracted {insights} insights, created {memories} memories, processed {journals_processed} journals")
            
            # Give some time for data to be processed
            time.sleep(2)
            return True
            
        except Exception as e:
            self.log_result("Agent Learning Trigger", False, f"Exception: {str(e)}")
            return False
    
    def test_agent_memory_get_after_learning(self):
        """Test GET /api/agent/memory after learning"""
        try:
            response = self.session.get(f"{BASE_URL}/agent/memory?limit=20")
            
            if response.status_code != 200:
                self.log_result("Get Agent Memories (After Learning)", False, f"HTTP {response.status_code}", response.text)
                return False
            
            data = response.json()
            
            if not isinstance(data, list):
                self.log_result("Get Agent Memories (After Learning)", False, "Response not an array")
                return False
            
            # Check if memories have proper structure
            if len(data) > 0:
                memory = data[0]
                required_fields = ["id", "memory_type", "content", "source", "importance", "timestamp"]
                missing_fields = [field for field in required_fields if field not in memory]
                
                if missing_fields:
                    self.log_result("Get Agent Memories (After Learning)", False, 
                                  f"Memory missing fields: {missing_fields}")
                    return False
                
                # Store memory IDs for later tests
                self.memory_ids = [m.get("id") for m in data if m.get("id")]
            
            self.log_result("Get Agent Memories (After Learning)", True, 
                          f"Retrieved {len(data)} memories after learning")
            return True
            
        except Exception as e:
            self.log_result("Get Agent Memories (After Learning)", False, f"Exception: {str(e)}")
            return False
    
    def test_learning_logs(self):
        """Test GET /api/agent/learning-logs"""
        try:
            response = self.session.get(f"{BASE_URL}/agent/learning-logs?limit=20")
            
            if response.status_code != 200:
                self.log_result("Get Learning Logs", False, f"HTTP {response.status_code}", response.text)
                return False
            
            data = response.json()
            
            if not isinstance(data, list):
                self.log_result("Get Learning Logs", False, "Response not an array")
                return False
            
            # Check structure if logs exist
            if len(data) > 0:
                log = data[0]
                required_fields = ["id", "learned_at", "insight", "source_data"]
                missing_fields = [field for field in required_fields if field not in log]
                
                if missing_fields:
                    self.log_result("Get Learning Logs", False, f"Log missing fields: {missing_fields}")
                    return False
            
            self.log_result("Get Learning Logs", True, f"Retrieved {len(data)} learning logs")
            return True
            
        except Exception as e:
            self.log_result("Get Learning Logs", False, f"Exception: {str(e)}")
            return False
    
    def test_update_persona(self):
        """Test PUT /api/agent/persona"""
        try:
            update_data = {
                "name": "Abishek's Learning Guide",
                "role": "Personalized Polymath Assistant", 
                "focus_areas": ["AI", "Technology", "Innovation"],
                "behavior_traits": ["Insightful", "Encouraging", "Analytical"],
                "custom_instructions": "Focus on connecting concepts across domains and identifying emerging patterns in my learning."
            }
            
            response = self.session.put(f"{BASE_URL}/agent/persona", json=update_data)
            
            if response.status_code != 200:
                self.log_result("Update Agent Persona", False, f"HTTP {response.status_code}", response.text)
                return False
            
            data = response.json()
            
            # Validate updated data
            if data.get("name") != update_data["name"]:
                self.log_result("Update Agent Persona", False, "Name not updated correctly")
                return False
            
            if data.get("role") != update_data["role"]:
                self.log_result("Update Agent Persona", False, "Role not updated correctly")
                return False
            
            if data.get("focus_areas") != update_data["focus_areas"]:
                self.log_result("Update Agent Persona", False, "Focus areas not updated correctly")
                return False
            
            self.log_result("Update Agent Persona", True, 
                          f"Updated persona: {data['name']} - {data['role']}")
            return True
            
        except Exception as e:
            self.log_result("Update Agent Persona", False, f"Exception: {str(e)}")
            return False
    
    def test_agent_chat(self):
        """Test GET /api/agent/chat"""
        try:
            message = "What should I focus on learning next?"
            response = self.session.get(f"{BASE_URL}/agent/chat", params={"message": message})
            
            if response.status_code != 200:
                self.log_result("Agent Chat", False, f"HTTP {response.status_code}", response.text)
                return False
            
            data = response.json()
            
            # Validate response structure
            required_fields = ["response", "memories_used", "persona"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                self.log_result("Agent Chat", False, f"Missing fields: {missing_fields}")
                return False
            
            response_text = data.get("response", "")
            memories_used = data.get("memories_used", 0)
            persona_name = data.get("persona", "")
            
            if not response_text:
                self.log_result("Agent Chat", False, "Empty response from agent")
                return False
            
            self.log_result("Agent Chat", True, 
                          f"Got response from {persona_name}, used {memories_used} memories")
            return True
            
        except Exception as e:
            self.log_result("Agent Chat", False, f"Exception: {str(e)}")
            return False
    
    def test_memory_consolidation(self):
        """Test POST /api/agent/consolidate"""
        try:
            response = self.session.post(f"{BASE_URL}/agent/consolidate")
            
            if response.status_code != 200:
                self.log_result("Memory Consolidation", False, f"HTTP {response.status_code}", response.text)
                return False
            
            data = response.json()
            
            # Should have consolidated and archived counts
            if "consolidated" not in data:
                self.log_result("Memory Consolidation", False, "Missing 'consolidated' field")
                return False
            
            consolidated = data.get("consolidated", 0)
            archived = data.get("archived", 0)
            
            self.log_result("Memory Consolidation", True, 
                          f"Consolidated {consolidated} memories, archived {archived}")
            return True
            
        except Exception as e:
            self.log_result("Memory Consolidation", False, f"Exception: {str(e)}")
            return False
    
    def test_create_manual_memory(self):
        """Test POST /api/agent/memory"""
        try:
            params = {
                "memory_type": "long_term",
                "content": "User prefers structured learning over random exploration",
                "source": "manual",
                "importance": 0.9
            }
            
            response = self.session.post(f"{BASE_URL}/agent/memory", params=params)
            
            if response.status_code != 200:
                self.log_result("Create Manual Memory", False, f"HTTP {response.status_code}", response.text)
                return False
            
            data = response.json()
            
            # Validate created memory
            required_fields = ["id", "memory_type", "content", "source", "importance"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                self.log_result("Create Manual Memory", False, f"Missing fields: {missing_fields}")
                return False
            
            if data.get("content") != params["content"]:
                self.log_result("Create Manual Memory", False, "Content mismatch")
                return False
            
            if data.get("memory_type") != params["memory_type"]:
                self.log_result("Create Manual Memory", False, "Memory type mismatch")
                return False
            
            if data.get("importance") != params["importance"]:
                self.log_result("Create Manual Memory", False, "Importance mismatch")
                return False
            
            self.log_result("Create Manual Memory", True, 
                          f"Created {data['memory_type']} memory with importance {data['importance']}")
            return True
            
        except Exception as e:
            self.log_result("Create Manual Memory", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all Agent Memory System tests in sequence"""
        print("🧠 Starting Agent Memory System Testing...")
        print(f"Backend URL: {BASE_URL}")
        print("=" * 70)
        
        # Test sequence for Agent Memory System
        tests = [
            ("Agent Stats", self.test_agent_stats),
            ("Get Agent Persona", self.test_agent_persona_get),
            ("Get Initial Memories", self.test_agent_memory_get_initial),
            ("Trigger Learning", self.test_agent_learn),
            ("Get Memories After Learning", self.test_agent_memory_get_after_learning),
            ("Get Learning Logs", self.test_learning_logs),
            ("Update Persona", self.test_update_persona),
            ("Agent Chat", self.test_agent_chat),
            ("Memory Consolidation", self.test_memory_consolidation),
            ("Create Manual Memory", self.test_create_manual_memory),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            print(f"\n🔍 Testing {test_name}...")
            try:
                success = test_func()
                if success:
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAIL {test_name}: Unexpected error - {str(e)}")
                failed += 1
        
        # Print summary
        print("\n" + "=" * 70)
        print("🧠 AGENT MEMORY SYSTEM TEST SUMMARY")
        print("=" * 70)
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📊 Total: {passed + failed}")
        
        if failed == 0:
            print("\n🎉 ALL AGENT MEMORY SYSTEM TESTS PASSED!")
            return True
        else:
            print(f"\n⚠️  {failed} test(s) failed. Check details above.")
            
            # Print failed tests details
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['message']}")
                    if result["details"]:
                        print(f"     Details: {result['details']}")
            
            return False

def main():
    """Main test execution"""
    print("🚀 Polymath OS - Agent Memory System Backend Testing")
    print("=" * 70)
    
    tester = AgentMemoryTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n✅ Agent Memory System is working correctly!")
        sys.exit(0)
    else:
        print("\n❌ Agent Memory System has issues that need fixing.")
        sys.exit(1)

if __name__ == "__main__":
    main()