"""
T05 Error contract unit tests — no live server, pure logic.

Tests 1-7 cover: closed enum, make_error shape, details always list,
request_id auto-generated, RBAC error shape, passthrough guard,
AST no-silent-catch check.

Run: cd /d/cognitive-os/worktrees/wt-05/backend && uv run pytest tests/test_error_contract.py -v
"""
import ast
import inspect
import pytest


# ── Test 1: closed enum has exactly 7 values ─────────────────────────────────


def test_error_code_enum_is_closed():
    """ErrorCode has exactly 7 values. Adding a value is a spec change."""
    from error_contract import ErrorCode
    assert len(ErrorCode) == 7, f"Expected 7 error codes, got {len(ErrorCode)}: {list(ErrorCode)}"


# ── Test 2: make_error returns correct shape ──────────────────────────────────


def test_make_error_shape():
    """make_error returns {code, details: [...], request_id}."""
    from error_contract import ErrorCode, make_error
    result = make_error(
        ErrorCode.VALIDATION_ERROR,
        "name required",
        path=["body", "name"],
        request_id="req-001",
    )
    assert result["code"] == "validation_error"
    assert result["request_id"] == "req-001"
    assert isinstance(result["details"], list)
    assert len(result["details"]) == 1
    assert result["details"][0]["path"] == ["body", "name"]
    assert result["details"][0]["message"] == "name required"


# ── Test 3: details is always a list ─────────────────────────────────────────


def test_make_error_details_is_list():
    """details is always a list, even for a single message."""
    from error_contract import ErrorCode, make_error
    result = make_error(ErrorCode.NOT_FOUND, "resource not found", request_id="r1")
    assert isinstance(result["details"], list)
    assert len(result["details"]) >= 1


# ── Test 4: request_id auto-generated when None ───────────────────────────────


def test_make_error_generates_request_id_if_none():
    """When request_id is None, a uuid4 is generated."""
    from error_contract import ErrorCode, make_error
    result = make_error(ErrorCode.INTERNAL, "server error")
    assert "request_id" in result
    assert isinstance(result["request_id"], str)
    assert len(result["request_id"]) > 0


# ── Test 5: RBAC denied error shape ──────────────────────────────────────────


def test_rbac_denied_error_shape():
    """make_error with RBAC_DENIED produces code='rbac_denied'."""
    from error_contract import ErrorCode, make_error
    result = make_error(
        ErrorCode.RBAC_DENIED,
        "insufficient role: agent:read_only",
        path=["header", "Authorization"],
        request_id="req-002",
    )
    assert result["code"] == "rbac_denied"
    assert result["details"][0]["path"] == ["header", "Authorization"]


# ── Test 6: already-shaped dicts pass through (no double-wrapping) ────────────


def test_guardrail_passthrough_not_rewrapped():
    """is_already_shaped returns True for dicts with 'code' and 'details' keys."""
    from error_contract import is_already_shaped
    guardrail_detail = {
        "code": "guardrail_reject",
        "details": [{"path": [], "message": "provenance downgrade"}],
        "request_id": "req-003",
    }
    assert is_already_shaped(guardrail_detail) is True
    # Plain string is NOT shaped
    assert is_already_shaped("provenance downgrade") is False
    # Dict without 'code' is NOT shaped
    assert is_already_shaped({"message": "error"}) is False


# ── Test 7: no silent catch in error_contract.py ─────────────────────────────


def test_no_silent_catch_in_error_contract():
    """
    AST check: error_contract.py contains no bare 'except: pass' or
    'except Exception: pass' without a re-raise or logging call.
    Pure logic module — should not swallow any exceptions.
    """
    import error_contract
    source = inspect.getsource(error_contract)
    tree = ast.parse(source)

    class SilentCatchVisitor(ast.NodeVisitor):
        def __init__(self):
            self.violations: list[str] = []

        def visit_ExceptHandler(self, node: ast.ExceptHandler):
            body = node.body
            # Silent if the only statement is Pass
            if len(body) == 1 and isinstance(body[0], ast.Pass):
                self.violations.append(
                    f"Silent 'except: pass' at line {node.lineno}"
                )
            self.generic_visit(node)

    visitor = SilentCatchVisitor()
    visitor.visit(tree)
    assert visitor.violations == [], (
        "error_contract.py has silent exception handlers:\n"
        + "\n".join(visitor.violations)
    )
