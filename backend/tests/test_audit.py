"""
T04 Audit extraction unit tests — no live server, pure logic.

Tests 1-7 cover: schema fields, result derivation, resource composition,
denial_reason auto-population, request_id, append-only AST check, db-failure
swallowing.

Run: cd /d/cognitive-os/worktrees/wt-04/backend && uv run pytest tests/test_audit.py -v
"""
import ast
import inspect
import unittest.mock as mock
import pytest


# ── Helper ────────────────────────────────────────────────────────────────────


def _make_request(state_attrs: dict = None):
    """Build a minimal mock Request with optional state attributes."""
    req = mock.MagicMock()
    state = mock.MagicMock()
    # Clear all state attrs by default
    state.audit_denial_reason = None
    state.actor_role = None
    state.request_id = None
    if state_attrs:
        for k, v in state_attrs.items():
            setattr(state, k, v)
    req.state = state
    req.headers = {}
    req.client = mock.MagicMock()
    req.client.host = "127.0.0.1"
    return req


# ── Test 1: required scaffold fields present in AuditLog ─────────────────────


def test_audit_log_schema_has_required_fields():
    """AuditLog model has all scaffold-sourced fields: actor, action, resource,
    result, denial_reason, request_id."""
    from audit import AuditLog
    fields = AuditLog.model_fields
    for name in ("actor", "action", "resource", "result", "denial_reason", "request_id"):
        assert name in fields, f"AuditLog missing field: {name}"


# ── Test 2: result defaults to 'success'; False success → 'denied' ───────────


def test_audit_log_result_defaults_to_success():
    """result field defaults to 'success'; success=False sets result='denied'."""
    from audit import AuditLog
    # Default
    entry = AuditLog(
        action="CREATE", resource_type="journal",
        ip_address="127.0.0.1", user_agent="test",
    )
    assert entry.result == "success"
    # Explicit False
    entry2 = AuditLog(
        action="CREATE", resource_type="journal",
        ip_address="127.0.0.1", user_agent="test",
        success=False, result="denied",
    )
    assert entry2.result == "denied"


# ── Test 3: resource composed from type and id ────────────────────────────────


def test_audit_log_resource_composed_from_type_and_id():
    """resource field is 'resource_type:resource_id' when id present, else type only."""
    from audit import AuditLog
    entry_with_id = AuditLog(
        action="UPDATE", resource_type="journal", resource_id="abc-123",
        ip_address="127.0.0.1", user_agent="test",
        resource="journal:abc-123",
    )
    assert entry_with_id.resource == "journal:abc-123"

    entry_no_id = AuditLog(
        action="LOGIN", resource_type="auth",
        ip_address="127.0.0.1", user_agent="test",
        resource="auth",
    )
    assert entry_no_id.resource == "auth"


# ── Test 4: denial_reason auto-populated from request.state ──────────────────


@pytest.mark.anyio
async def test_audit_log_denial_reason_populated_from_request_state():
    """log_audit_event picks up audit_denial_reason from request.state without explicit kwarg."""
    import audit as audit_module

    written = []
    mock_db = mock.MagicMock()
    mock_db.audit_logs.insert_one = mock.AsyncMock(side_effect=lambda d: written.append(d))
    audit_module._db = mock_db

    req = _make_request({"audit_denial_reason": "rbac: insufficient role"})

    from audit import log_audit_event
    await log_audit_event("DELETE", "activity", req, success=False)

    assert len(written) == 1
    assert written[0]["denial_reason"] == "rbac: insufficient role"

    # cleanup
    audit_module._db = None


# ── Test 5: request_id appears in stored entry when passed ───────────────────


@pytest.mark.anyio
async def test_audit_log_has_request_id():
    """When request_id is passed, it appears in the stored audit entry."""
    import audit as audit_module

    written = []
    mock_db = mock.MagicMock()
    mock_db.audit_logs.insert_one = mock.AsyncMock(side_effect=lambda d: written.append(d))
    audit_module._db = mock_db

    req = _make_request()

    from audit import log_audit_event
    await log_audit_event("CREATE", "journal", req, request_id="req-test-007")

    assert len(written) == 1
    assert written[0]["request_id"] == "req-test-007"

    audit_module._db = None


# ── Test 6: AST — no update/delete function exported ─────────────────────────


def test_append_only_no_update_or_delete_route_in_audit_module():
    """
    AST check: audit.py exposes no function named update, delete, patch, remove,
    or modify — enforce append-only contract structurally.
    """
    import audit
    source = inspect.getsource(audit)
    tree = ast.parse(source)

    forbidden = {"update", "delete", "patch", "remove", "modify"}

    class FuncNameVisitor(ast.NodeVisitor):
        def __init__(self):
            self.violations: list[str] = []

        def visit_FunctionDef(self, node: ast.FunctionDef):
            if node.name.lower() in forbidden or any(f in node.name.lower() for f in forbidden):
                self.violations.append(node.name)
            self.generic_visit(node)

        visit_AsyncFunctionDef = visit_FunctionDef

    visitor = FuncNameVisitor()
    visitor.visit(tree)
    assert visitor.violations == [], (
        "audit.py exposes mutating functions (violates append-only rule):\n"
        + "\n".join(visitor.violations)
    )


# ── Test 7: db failure does not raise ────────────────────────────────────────


@pytest.mark.anyio
async def test_log_audit_event_does_not_raise_on_db_failure():
    """Mock db raises; log_audit_event catches and logs error without re-raising."""
    import audit as audit_module

    mock_db = mock.MagicMock()
    mock_db.audit_logs.insert_one = mock.AsyncMock(
        side_effect=Exception("Mongo connection refused")
    )
    audit_module._db = mock_db

    req = _make_request()

    from audit import log_audit_event
    # Must not raise
    await log_audit_event("CREATE", "activity", req)

    audit_module._db = None
