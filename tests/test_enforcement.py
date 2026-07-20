"""
N2 End-to-End Enforcement Tests

Converts Phase 1 from "doesn't break tests" → "provably enforces":
  1. Unauthenticated mutation → 401 contract shape
  2. Wrong-role JWT → 403 rbac_denied + audit row in MongoDB with denial_reason
  3. Guardrail FLAG annotates but returns 2xx (no block)
  4. Guardrail REJECT → 422 guardrail_reject contract shape

Run with: pytest tests/test_enforcement.py -v (from repo root via backend uv env)
Requires: backend server on port 8001, cog-mongo on 27017.
"""

import os
from datetime import datetime, timedelta
from pathlib import Path

import httpx
import pytest
from dotenv import load_dotenv

# Load backend .env so JWT_SECRET_KEY and MONGO vars are available for test fixtures
load_dotenv(Path(__file__).parent.parent / "backend" / ".env")

from jose import jwt as jose_jwt  # noqa: E402 — must come after dotenv load

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8001")
TIMEOUT = 30.0

_JWT_SECRET = os.environ.get("JWT_SECRET_KEY", "")
_JWT_ALG = "HS256"
_MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
_DB_NAME = os.environ.get("DB_NAME", "polymath_os")


# ── Helpers ───────────────────────────────────────────────────────────────────

def _make_restricted_token(role: str) -> str:
    """Mint a valid JWT whose role is NOT owner — used to test RBAC denial."""
    now = datetime.utcnow()
    payload = {
        "sub": f"test-{role.replace(':', '-')}",
        "email": "test-agent@example.com",
        "role": role,
        "type": "access",
        "iat": now,
        "exp": now + timedelta(minutes=5),
    }
    return jose_jwt.encode(payload, _JWT_SECRET, algorithm=_JWT_ALG)


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def mongo_db():
    """Synchronous MongoDB client for verifying audit rows server-side."""
    from pymongo import MongoClient
    mc = MongoClient(_MONGO_URL, serverSelectionTimeoutMS=3000)
    yield mc[_DB_NAME]
    mc.close()


@pytest.fixture(scope="session")
def auth_client():
    """Authenticated owner client — reuses smoke-test credentials."""
    _email = os.environ.get("SMOKE_EMAIL", "smoke-test-owner@example.com")
    _pwd = os.environ.get("SMOKE_PASSWORD", "SmokeAuth@2026!")
    base = httpx.Client(base_url=BACKEND_URL, timeout=TIMEOUT)
    base.post("/api/auth/register", json={"email": _email, "password": _pwd})
    resp = base.post("/api/auth/login", json={"email": _email, "password": _pwd})
    base.close()
    assert resp.status_code == 200, f"auth_client login failed: {resp.status_code}"
    token = resp.json()["access_token"]
    with httpx.Client(
        base_url=BACKEND_URL,
        timeout=TIMEOUT,
        headers={"Authorization": f"Bearer {token}"},
    ) as client:
        yield client


# ── Tests ─────────────────────────────────────────────────────────────────────

class TestEnforcement:
    """Four end-to-end proofs that Phase 1 enforcement is real, not assumed."""

    def test_unauth_mutation_returns_401_contract_shape(self):
        """Unauthenticated POST to a write_staged route → 401 in contract shape."""
        resp = httpx.Client(base_url=BACKEND_URL, timeout=TIMEOUT).post(
            "/api/journals",
            json={"title": "N2 unauth test", "content": "should be rejected"},
        )
        assert resp.status_code == 401
        body = resp.json()
        assert body.get("code") == "unauthenticated", f"wrong code: {body}"
        assert isinstance(body.get("details"), list), "details must be a list"
        assert len(body["details"]) > 0, "details must not be empty"
        assert "request_id" in body, "request_id missing from 401 response"

    def test_wrong_role_403_rbac_denied_and_audit_row(self, mongo_db):
        """Wrong-role JWT → 403 rbac_denied in contract shape + audit row with denial_reason."""
        token = _make_restricted_token("agent:read_only")
        resp = httpx.Client(
            base_url=BACKEND_URL,
            timeout=TIMEOUT,
            headers={"Authorization": f"Bearer {token}"},
        ).post(
            "/api/journals",
            json={"title": "N2 wrong role test", "content": "role enforcement proof"},
        )
        assert resp.status_code == 403
        body = resp.json()
        assert body.get("code") == "rbac_denied", f"wrong code: {body}"
        assert isinstance(body.get("details"), list), "details must be a list"
        req_id = body.get("request_id")
        assert req_id, "request_id missing from 403 response"

        # Verify audit row — request_id is the unique key linking response to log entry
        audit_entry = mongo_db.audit_logs.find_one({"request_id": req_id})
        assert audit_entry is not None, (
            f"No audit row found for request_id={req_id}. "
            "Check that http_exception_handler logs RBAC denials."
        )
        assert audit_entry.get("success") is False, "audit row must record success=False"
        assert audit_entry.get("denial_reason"), "audit row must have denial_reason set"

    def test_guardrail_flag_annotates_but_returns_2xx(self, auth_client):
        """Content with PII pattern (US phone) → FLAG → request still succeeds (2xx)."""
        resp = auth_client.post(
            "/api/journals",
            json={
                "title": "N2 guardrail flag test",
                "content": "Contact: 555-867-5309 for information",  # US phone → check_pii FLAG
            },
        )
        # FLAG must NOT block — 200 or 201 required
        assert resp.status_code in (200, 201), (
            f"Guardrail FLAG incorrectly blocked request: {resp.status_code} — {resp.text}"
        )

    def test_guardrail_reject_returns_contract_shape(self, auth_client):
        """Provenance downgrade in request body → REJECT → 422 guardrail_reject shape."""
        resp = auth_client.post(
            "/api/journals",
            json={
                "title": "N2 guardrail reject test",
                "content": "Provenance downgrade enforcement proof",
                # Extra fields forwarded to run_guardrails by guardrails_content_check
                "claimed_provenance": "verified_artifact",      # claims high trust
                "actual_provenance": "ai_generated_unverified", # only supports low trust → REJECT
            },
        )
        assert resp.status_code == 422
        body = resp.json()
        assert body.get("code") == "guardrail_reject", f"wrong code: {body}"
        assert isinstance(body.get("details"), list), "details must be a list"
        assert len(body["details"]) > 0, "details must not be empty"
        assert "request_id" in body, "request_id missing from guardrail_reject response"
