"""
T02 RBAC unit tests — no live server, no DB, pure logic.
Translated from reference/scaffold/backend/src/__tests__/rbac.test.js (tests 1-5),
then system-specific additions (6-10).

Run: cd /d/cognitive-os/worktrees/wt-02 && uv run pytest backend/tests/test_rbac.py -v
"""
import os
import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException


def make_request(request_id: str = "test-req-id"):
    """Create a minimal mock Request with state."""
    req = MagicMock()
    req.state.request_id = request_id
    req.state.audit_denial_reason = None
    return req


# ── Scaffold-translated tests (1-5) ────────────────────────────────────────


def test_unauthenticated_returns_401():
    """Scaffold test 1: missing identity → 401, not 403."""
    from rbac import check_permission
    req = make_request()
    with pytest.raises(HTTPException) as exc_info:
        check_permission(None, "read", req)
    assert exc_info.value.status_code == 401


def test_agent_read_only_cannot_write_staged():
    """Scaffold test 2: agent:read_only denied write_staged → 403 with audit reason."""
    from rbac import check_permission
    req = make_request()
    with pytest.raises(HTTPException) as exc_info:
        check_permission("agent:read_only", "write_staged", req)
    assert exc_info.value.status_code == 403
    assert exc_info.value.detail["code"] == "rbac_denied"
    # auditDenialReason must be set on request state (feeds audit trail)
    assert req.state.audit_denial_reason is not None
    assert "write_staged" in req.state.audit_denial_reason


def test_agent_staged_write_can_write_staged():
    """Scaffold test 3: agent:staged_write allowed → no exception raised."""
    from rbac import check_permission
    req = make_request()
    # Must not raise
    check_permission("agent:staged_write", "write_staged", req)


def test_grant_role_escalation_blocked_for_non_owner():
    """Scaffold test 4: escalation hard-stop for non-owner; owner passes."""
    from rbac import check_permission
    # Non-owner trying grant_role → 403 with escalation reason
    req = make_request()
    with pytest.raises(HTTPException) as exc_info:
        check_permission("agent:staged_write", "grant_role", req)
    assert exc_info.value.status_code == 403
    assert "escalation" in req.state.audit_denial_reason

    # Owner CAN grant_role
    req2 = make_request()
    check_permission("owner", "grant_role", req2)  # must not raise


def test_no_agent_role_has_write_commit():
    """Scaffold test 5: no agent:* role contains write_commit — pure dict inspection."""
    from rbac import PERMISSIONS
    for role, actions in PERMISSIONS.items():
        if role == "owner":
            continue
        assert "write_commit" not in actions, (
            f"role '{role}' unexpectedly has write_commit"
        )


# ── System-specific tests (6-10) ───────────────────────────────────────────


def test_owner_has_full_access():
    """Owner passes all actions including escalation-guarded grant_role."""
    from rbac import check_permission
    from rbac import PERMISSIONS
    req = make_request()
    for action in PERMISSIONS["owner"]:
        check_permission("owner", action, req)  # none must raise


def test_agent_service_limited_to_audit_and_invoke():
    """agent:service is blocked on read, write_staged, write_commit, delete, export."""
    from rbac import check_permission
    blocked_actions = ["write_staged", "write_commit", "delete", "export"]
    for action in blocked_actions:
        req = make_request()
        with pytest.raises(HTTPException) as exc_info:
            check_permission("agent:service", action, req)
        assert exc_info.value.status_code == 403, (
            f"Expected 403 for agent:service + {action}"
        )


def test_missing_jwt_secret_raises_on_startup():
    """verify_startup_config() raises RuntimeError when JWT_SECRET_KEY is absent
    or equals the known default sentinel."""
    from rbac import verify_startup_config, DEFAULT_JWT_SENTINEL

    # Unset
    saved = os.environ.pop("JWT_SECRET_KEY", None)
    try:
        with pytest.raises(RuntimeError, match="JWT_SECRET_KEY"):
            verify_startup_config()
    finally:
        if saved is not None:
            os.environ["JWT_SECRET_KEY"] = saved

    # Default sentinel
    os.environ["JWT_SECRET_KEY"] = DEFAULT_JWT_SENTINEL
    try:
        with pytest.raises(RuntimeError, match="JWT_SECRET_KEY"):
            verify_startup_config()
    finally:
        if saved is not None:
            os.environ["JWT_SECRET_KEY"] = saved
        else:
            os.environ.pop("JWT_SECRET_KEY", None)


def test_rbac_denied_produces_correct_error_shape():
    """Denied access produces {code, details, request_id} shape."""
    from rbac import check_permission
    req = make_request(request_id="shaped-req-123")
    with pytest.raises(HTTPException) as exc_info:
        check_permission("agent:read_only", "delete", req)
    detail = exc_info.value.detail
    assert detail["code"] == "rbac_denied"
    assert isinstance(detail["details"], list)
    assert len(detail["details"]) > 0
    assert "message" in detail["details"][0]
    assert detail["request_id"] == "shaped-req-123"


def test_no_permissive_bypass_flag_exists():
    """
    AST-based enforcement: rbac.py must contain NO env reads outside
    verify_startup_config, and NO conditional branching on env values inside
    permission-decision paths (check_permission / require_permission).

    Why AST, not source-grep: word-grep flags words in docstrings and comments
    (e.g. "bypass", "permissive", "development"), which tests DOCUMENTATION not
    BEHAVIOR. AST structural analysis catches real bypass code while leaving
    comments free. Recorded in 02-rbac-port-decisions.md.
    """
    import ast
    import inspect
    import rbac

    source = inspect.getsource(rbac)
    tree = ast.parse(source)

    # --- Check 1: os.environ / os.getenv only inside verify_startup_config ---
    # Collect all Call nodes that read env vars
    env_read_names = {"environ", "getenv"}

    class EnvReadVisitor(ast.NodeVisitor):
        def __init__(self):
            self.violations: list[str] = []
            self._current_func: str | None = None

        def visit_FunctionDef(self, node: ast.FunctionDef):
            outer = self._current_func
            self._current_func = node.name
            self.generic_visit(node)
            self._current_func = outer

        visit_AsyncFunctionDef = visit_FunctionDef

        def visit_Attribute(self, node: ast.Attribute):
            # Catch os.environ.get / os.environ[...] / os.getenv
            if (
                node.attr in env_read_names
                and self._current_func != "verify_startup_config"
            ):
                self.violations.append(
                    f"env read '{node.attr}' found outside verify_startup_config "
                    f"(in {self._current_func!r})"
                )
            self.generic_visit(node)

    env_visitor = EnvReadVisitor()
    env_visitor.visit(tree)
    assert env_visitor.violations == [], (
        "rbac.py reads env vars outside verify_startup_config:\n"
        + "\n".join(env_visitor.violations)
    )

    # --- Check 2: no If-on-env-value inside permission-decision functions ---
    permission_funcs = {"check_permission", "require_permission", "_get_role_from_credentials"}

    class EnvBranchVisitor(ast.NodeVisitor):
        def __init__(self):
            self.violations: list[str] = []
            self._current_func: str | None = None

        def visit_FunctionDef(self, node: ast.FunctionDef):
            outer = self._current_func
            self._current_func = node.name
            self.generic_visit(node)
            self._current_func = outer

        visit_AsyncFunctionDef = visit_FunctionDef

        def visit_If(self, node: ast.If):
            if self._current_func in permission_funcs:
                # Serialize the condition for simple string check
                cond_src = ast.unparse(node.test)
                if "environ" in cond_src or "getenv" in cond_src:
                    self.violations.append(
                        f"If-on-env in {self._current_func!r}: {cond_src!r}"
                    )
            self.generic_visit(node)

    branch_visitor = EnvBranchVisitor()
    branch_visitor.visit(tree)
    assert branch_visitor.violations == [], (
        "rbac.py branches on env value inside permission-decision path:\n"
        + "\n".join(branch_visitor.violations)
    )
