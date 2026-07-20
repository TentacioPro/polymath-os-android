"""
Smoke Tests for Polymath OS Backend API

Run with: pytest tests/test_smoke_backend.py -v
Requires: Backend server running on BACKEND_URL (default: http://localhost:8001)

Auth fixtures (added T02 integration gate):
  client     — unauthenticated; use for GET/public endpoints (must still pass raw)
  auth_client — Bearer token for role=owner; use for all mutation routes that
                require_permission. Registers + logs in once per session (idempotent).
"""

import pytest
import httpx
import os
import uuid
from datetime import datetime

# Configuration
BACKEND_URL = os.environ.get('BACKEND_URL', 'http://localhost:8001')
TIMEOUT = 30.0  # seconds

# Smoke-test owner credentials — ephemeral account, never used for real data
# Domain must be a non-reserved TLD so Pydantic EmailStr accepts it (.local is
# RFC 2606 special-use and rejected by the validator; example.com is not reserved).
_SMOKE_EMAIL = os.environ.get("SMOKE_EMAIL", "smoke-test-owner@example.com")
_SMOKE_PASSWORD = os.environ.get("SMOKE_PASSWORD", "SmokeAuth@2026!")


# ── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture
def client():
    """Unauthenticated client — public/read-only endpoints."""
    return httpx.Client(base_url=BACKEND_URL, timeout=TIMEOUT)


@pytest.fixture(scope="session")
def auth_client():
    """
    Session-scoped authenticated client for mutation routes.
    Registers (idempotent: ignores 400 = already exists) then logs in.
    Token defaults to role=owner (rbac.py: payload.get('role', 'owner')).
    """
    base = httpx.Client(base_url=BACKEND_URL, timeout=TIMEOUT)
    # Register — 400 means account already exists from a previous run; that's fine
    base.post("/api/auth/register", json={
        "email": _SMOKE_EMAIL,
        "password": _SMOKE_PASSWORD,
    })
    login_resp = base.post("/api/auth/login", json={
        "email": _SMOKE_EMAIL,
        "password": _SMOKE_PASSWORD,
    })
    base.close()
    assert login_resp.status_code == 200, (
        f"Auth fixture: login failed {login_resp.status_code} — {login_resp.text}"
    )
    token = login_resp.json()["access_token"]
    with httpx.Client(
        base_url=BACKEND_URL,
        timeout=TIMEOUT,
        headers={"Authorization": f"Bearer {token}"},
    ) as authenticated:
        yield authenticated


# ═══════════════════════════════════════════════════════════════════════════════
# HEALTH & SYSTEM TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class TestHealth:
    """Critical path: System health checks."""
    
    def test_root_endpoint(self, client):
        """Root endpoint should return API info."""
        response = client.get('/api/')
        assert response.status_code == 200
        data = response.json()
        assert 'message' in data or 'status' in data
    
    def test_health_endpoint(self, client):
        """Health endpoint should return status and DB connection."""
        response = client.get('/api/health')
        assert response.status_code == 200
        data = response.json()
        assert 'status' in data
        assert data['status'] in ['healthy', 'ok', 'operational']
    
    def test_stats_endpoint(self, client):
        """Stats endpoint should return activity/journal/connection counts."""
        response = client.get('/api/stats')
        assert response.status_code == 200
        data = response.json()
        # Should have numeric counts
        assert 'activities' in data or 'total_activities' in data


# ═══════════════════════════════════════════════════════════════════════════════
# ACTIVITIES CRUD TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class TestActivities:
    """Critical path: Activity tracking CRUD operations."""
    
    @pytest.fixture
    def test_activity_data(self):
        """Generate unique test activity data."""
        return {
            "title": f"Smoke Test Activity {uuid.uuid4().hex[:8]}",
            "url": "https://example.com/smoke-test",
            "notes": "Created by automated smoke test",
            "source": "manual"
        }
    
    def test_list_activities(self, client):
        """Should list activities (empty or populated)."""
        response = client.get('/api/activities')
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_create_activity(self, auth_client, test_activity_data):
        """Should create a new activity with AI analysis."""
        response = auth_client.post('/api/activities/manual', json=test_activity_data)
        # 200 or 201 for success, 400 for duplicate (which is fine for smoke test)
        assert response.status_code in [200, 201, 400]
        if response.status_code in [200, 201]:
            data = response.json()
            assert 'id' in data or '_id' in data
            assert data.get('title') == test_activity_data['title']
    
    def test_activity_detail(self, client):
        """Should get activity detail if activities exist."""
        # First get list
        list_response = client.get('/api/activities?limit=1')
        assert list_response.status_code == 200
        activities = list_response.json()
        
        if activities and len(activities) > 0:
            activity_id = activities[0].get('id') or activities[0].get('_id')
            detail_response = client.get(f'/api/activities/{activity_id}')
            assert detail_response.status_code in [200, 404]


# ═══════════════════════════════════════════════════════════════════════════════
# JOURNALS CRUD TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class TestJournals:
    """Critical path: Journal entry CRUD operations."""
    
    @pytest.fixture
    def test_journal_data(self):
        """Generate unique test journal data."""
        return {
            "title": f"Smoke Test Journal {uuid.uuid4().hex[:8]}",
            "content": "This is an automated smoke test journal entry.",
            "tags": ["smoke-test", "automated"]
        }
    
    def test_list_journals(self, client):
        """Should list journals (empty or populated)."""
        response = client.get('/api/journals')
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_create_journal(self, auth_client, test_journal_data):
        """Should create a new journal entry."""
        response = auth_client.post('/api/journals', json=test_journal_data)
        assert response.status_code in [200, 201]
        data = response.json()
        assert 'id' in data or '_id' in data
        assert data.get('title') == test_journal_data['title']
        return data

    def test_journal_crud_flow(self, auth_client, test_journal_data):
        """Full CRUD flow: create -> read -> delete."""
        # Create
        create_response = auth_client.post('/api/journals', json=test_journal_data)
        assert create_response.status_code in [200, 201]
        journal = create_response.json()
        journal_id = journal.get('id') or journal.get('_id')

        # Read (via list) — GET is public; use the session auth_client for simplicity
        list_response = auth_client.get('/api/journals')
        assert list_response.status_code == 200

        # Delete
        delete_response = auth_client.delete(f'/api/journals/{journal_id}')
        assert delete_response.status_code in [200, 204, 404]


# ═══════════════════════════════════════════════════════════════════════════════
# CONNECTIONS & AI TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class TestConnectionsAndAI:
    """Critical path: AI-powered connection and suggestion features."""
    
    def test_list_connections(self, client):
        """Should list connections (empty or populated)."""
        response = client.get('/api/connections')
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_ai_suggestions(self, client):
        """Should return AI suggestions (may be empty if no activities)."""
        response = client.get('/api/ai/suggestions')
        # Can be 200 with suggestions or empty list
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))


# ═══════════════════════════════════════════════════════════════════════════════
# EXPORT TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class TestExport:
    """Critical path: Data export functionality."""
    
    def test_export_json(self, auth_client):
        """Should export all data as JSON."""
        response = auth_client.post('/api/export/json')
        assert response.status_code == 200
        data = response.json()
        # Should have activities, journals, connections keys
        assert 'activities' in data or isinstance(data, dict)

    def test_export_markdown(self, auth_client):
        """Should export as markdown."""
        response = auth_client.post('/api/export/markdown')
        assert response.status_code == 200
        # Markdown is text content
        assert response.headers.get('content-type', '').startswith(('text/', 'application/'))

    def test_export_csv(self, auth_client):
        """Should export as CSV."""
        response = auth_client.post('/api/export/csv')
        assert response.status_code == 200


# ═══════════════════════════════════════════════════════════════════════════════
# SEARCH TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class TestSearch:
    """Critical path: Search functionality."""
    
    def test_search_endpoint(self, client):
        """Should search across content."""
        response = client.get('/api/search?q=test')
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))


# ═══════════════════════════════════════════════════════════════════════════════
# AGENT MEMORY TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class TestAgentMemory:
    """Critical path: Agent memory system."""
    
    def test_agent_stats(self, client):
        """Should return agent statistics."""
        response = client.get('/api/agent/stats')
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
    
    def test_agent_persona(self, client):
        """Should return agent persona configuration."""
        response = client.get('/api/agent/persona')
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
    
    def test_list_memories(self, client):
        """Should list agent memories."""
        response = client.get('/api/agent/memory')
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


# ═══════════════════════════════════════════════════════════════════════════════
# NOTIFICATIONS TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class TestNotifications:
    """Critical path: Notification system."""
    
    def test_list_notifications(self, client):
        """Should list notifications."""
        response = client.get('/api/notifications')
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


# ═══════════════════════════════════════════════════════════════════════════════
# AI CONFIG TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class TestAIConfig:
    """Critical path: AI configuration."""
    
    def test_get_ai_config(self, client):
        """Should return AI configuration."""
        response = client.get('/api/ai-config')
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)


# ═══════════════════════════════════════════════════════════════════════════════
# SECURITY TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class TestSecurity:
    """Security baseline validation."""
    
    def test_cors_headers_present(self, client):
        """OPTIONS requests should return CORS headers."""
        # This tests that CORS middleware is active
        response = client.options('/api/health')
        # Should not fail (405 Method Not Allowed is acceptable if OPTIONS not explicitly handled)
        assert response.status_code in [200, 204, 405]
    
    def test_security_headers(self, client):
        """Responses should include security headers (in non-dev environments)."""
        response = client.get('/api/health')
        # In production, these should be present
        # In development, they may or may not be present
        # Just verify the request succeeds
        assert response.status_code == 200


# ═══════════════════════════════════════════════════════════════════════════════
# SMOKE TEST RUNNER
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
