"""
Regression tests — three bugs locked by name.

Each test names the specific bug it guards in its docstring. A future refactor
that reintroduces any of these bugs will fail here with the diagnosis inline.

  R01 — dotenv-ordering: JWT_SECRET_KEY empty at server start → forged tokens 401 not 403
  R02 — provenance-string-cast: raw string .value → AttributeError → 500
  R03 — rbac-audit-gap: 403 denials not written to audit_logs

Requires: backend server on 8001 (uv run uvicorn server:app --port 8001),
          cog-mongo on 27017 (docker start cog-mongo).
Run: cd backend && uv run pytest ../tests/test_regressions.py -v
"""

import os
from datetime import datetime, timedelta
from pathlib import Path

import httpx
import pytest
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / "backend" / ".env")

from jose import jwt as jose_jwt  # noqa: E402 — must come after dotenv load

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8001")
TIMEOUT = 30.0

_JWT_SECRET = os.environ.get("JWT_SECRET_KEY", "")
_JWT_ALG = "HS256"
_MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
_DB_NAME = os.environ.get("DB_NAME", "polymath_os")


def _make_restricted_token(role: str) -> str:
    """Mint a valid JWT signed with the real secret whose role is NOT owner."""
    now = datetime.utcnow()
    return jose_jwt.encode(
        {
            "sub": f"test-{role.replace(':', '-')}",
            "email": "test-agent@example.com",
            "role": role,
            "type": "access",
            "iat": now,
            "exp": now + timedelta(minutes=5),
        },
        _JWT_SECRET,
        algorithm=_JWT_ALG,
    )


@pytest.fixture(scope="session")
def mongo_db():
    """Direct MongoDB client for verifying server-side audit rows."""
    from pymongo import MongoClient
    mc = MongoClient(_MONGO_URL, serverSelectionTimeoutMS=3000)
    yield mc[_DB_NAME]
    mc.close()


@pytest.fixture(scope="session")
def owner_client():
    """Authenticated owner-role client reusing smoke-test credentials."""
    email = os.environ.get("SMOKE_EMAIL", "smoke-test-owner@example.com")
    pwd = os.environ.get("SMOKE_PASSWORD", "SmokeAuth@2026!")
    base = httpx.Client(base_url=BACKEND_URL, timeout=TIMEOUT)
    base.post("/api/auth/register", json={"email": email, "password": pwd})
    resp = base.post("/api/auth/login", json={"email": email, "password": pwd})
    base.close()
    assert resp.status_code == 200, f"owner_client login failed: {resp.status_code}"
    token = resp.json()["access_token"]
    with httpx.Client(
        base_url=BACKEND_URL,
        timeout=TIMEOUT,
        headers={"Authorization": f"Bearer {token}"},
    ) as client:
        yield client


class TestRegressions:
    """Three targeted regressions — each one names the bug it locks."""

    def test_dotenv_loaded_before_auth_import(self):
        """R01 — dotenv-ordering bug.

        auth.py captures JWT_SECRET_KEY at module scope (module-level assignment).
        If server.py runs load_dotenv AFTER importing auth, the secret is captured
        as '' and ALL tokens signed with the real key fail signature verification
        → 401 (invalid token) instead of the expected 403 (wrong role).

        Fix: load_dotenv is the first statement in server.py, before any local import.

        Failure mode reproduced: a correctly-signed wrong-role token produces 403.
        If this regresses to 401, the server's JWT_SECRET_KEY was '' at startup —
        load_dotenv ran after auth import.
        """
        token = _make_restricted_token("agent:read_only")
        resp = httpx.Client(base_url=BACKEND_URL, timeout=TIMEOUT).post(
            "/api/journals",
            headers={"Authorization": f"Bearer {token}"},
            json={"title": "regression-R01-dotenv-ordering"},
        )
        assert resp.status_code == 403, (
            f"Expected 403 (wrong role). Got {resp.status_code}. "
            "401 → JWT_SECRET_KEY was '' at server startup "
            "(load_dotenv ran after auth import in server.py)."
        )
        assert resp.json().get("code") == "rbac_denied", (
            f"Expected rbac_denied error code, got: {resp.json()}"
        )

    def test_provenance_downgrade_accepts_string_input(self, owner_client):
        """R02 — provenance-string-cast bug.

        guardrails_content_check forwarded claimed_provenance / actual_provenance
        as raw strings from the JSON body. check_provenance_downgrade calls
        claimed.value inside a format string — raw str objects have no .value
        attribute → AttributeError → 500 Internal Error.

        Fix: values are cast to Provenance(value) enum at the HTTP boundary in
        guardrails_content_check, before passing to run_guardrails.

        Failure mode reproduced: sending string provenance values (the exact shape
        any HTTP client sends) must never produce a 500. The correct path is
        cast → downgrade detected → 422 guardrail_reject.
        """
        resp = owner_client.post(
            "/api/journals",
            json={
                "title": "regression-R02-provenance-string-cast",
                "content": "Provenance downgrade — sent as raw strings from HTTP client.",
                # These are raw JSON strings, NOT Provenance enum members.
                # Before fix: .value on raw string → AttributeError → 500.
                "claimed_provenance": "verified_artifact",
                "actual_provenance": "ai_generated_unverified",
            },
        )
        assert resp.status_code != 500, (
            f"Got 500 — raw string provenance values were not cast to Provenance enum "
            f"at the HTTP boundary (guardrails_content_check). Response: {resp.text[:300]}"
        )
        assert resp.status_code == 422, (
            f"Expected 422 (guardrail_reject after enum cast). Got {resp.status_code}."
        )
        assert resp.json().get("code") == "guardrail_reject"

    def test_rbac_denial_writes_audit_row_with_denial_reason(self, mongo_db):
        """R03 — rbac-audit-gap bug.

        http_exception_handler did not write audit rows for 401/403 RBAC denials,
        leaving access rejections invisible to the audit trail — a security
        observability gap (denials happened; nothing was recorded).

        Fix: http_exception_handler now calls log_audit_event for unauthenticated
        and rbac_denied responses with denial_reason populated from request state.

        Failure mode reproduced: a wrong-role 403 must produce exactly one
        audit_logs document with denial_reason set to a non-empty string.
        """
        token = _make_restricted_token("agent:read_only")
        resp = httpx.Client(
            base_url=BACKEND_URL,
            timeout=TIMEOUT,
            headers={"Authorization": f"Bearer {token}"},
        ).post(
            "/api/journals",
            json={"title": "regression-R03-rbac-audit-gap"},
        )
        assert resp.status_code == 403
        req_id = resp.json().get("request_id")
        assert req_id, "403 response must include request_id for audit correlation"

        audit_entry = mongo_db.audit_logs.find_one({"request_id": req_id})
        assert audit_entry is not None, (
            f"No audit_logs row found for request_id={req_id}. "
            "RBAC denial was not written to audit — "
            "http_exception_handler is not logging 403 denials."
        )
        assert audit_entry.get("success") is False, (
            "audit row must record success=False for a denied request"
        )
        denial_reason = audit_entry.get("denial_reason")
        assert denial_reason, (
            f"audit_logs row exists but denial_reason is empty/null: {audit_entry}. "
            "denial_reason must be propagated from request state to the audit row."
        )
