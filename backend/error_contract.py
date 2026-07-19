"""
error_contract.py — Closed error-code enum and standard response shape (T05).

Every non-2xx response from the backend uses make_error() or passes through
an already-shaped dict. FastAPI exception handlers are registered in server.py.

Spec: specs/modules/validation-error-handling.spec.md
Scaffold: reference/scaffold/specs/api.spec.md (request_id in every response)

Hard rules:
- ErrorCode is a closed enum (7 values). Adding a value is a spec change.
- Clients switch on `code`, never on message strings or HTTP status alone.
- `request_id` appears in every response (success and error).
- Already-shaped dicts (guardrail/RBAC) pass through unchanged — no double-wrapping.
- No silent catch: exceptions become contract-shaped responses + audit entries, or crash loudly.
"""
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class ErrorCode(str, Enum):
    """Closed error code enum — exactly 7 values. Adding a value requires a spec change."""
    VALIDATION_ERROR = "validation_error"
    RBAC_DENIED = "rbac_denied"
    GUARDRAIL_FLAG = "guardrail_flag"
    GUARDRAIL_REJECT = "guardrail_reject"
    NOT_FOUND = "not_found"
    CONFLICT = "conflict"
    INTERNAL = "internal"


@dataclass
class ErrorDetail:
    path: list[str]
    message: str

    def to_dict(self) -> dict:
        return {"path": self.path, "message": self.message}


def make_error(
    code: ErrorCode,
    message: str,
    path: Optional[list[str]] = None,
    request_id: Optional[str] = None,
    extra_details: Optional[list[ErrorDetail]] = None,
) -> dict:
    """
    Build a contract-shaped error response dict.

    Args:
        code: one of the 7 closed ErrorCode values
        message: human-readable, actionable description of the problem
        path: JSON path to the offending field (e.g. ["body", "title"])
        request_id: correlates audit log + Opik trace; generated if None
        extra_details: additional ErrorDetail entries beyond the primary message

    Returns:
        {"code": str, "details": [{"path": [...], "message": str}, ...], "request_id": str}
    """
    if request_id is None:
        request_id = str(uuid.uuid4())

    primary = ErrorDetail(path=path or [], message=message)
    details = [primary] + (extra_details or [])

    return {
        "code": code.value if isinstance(code, ErrorCode) else code,
        "details": [d.to_dict() for d in details],
        "request_id": request_id,
    }


def is_already_shaped(detail) -> bool:
    """
    Return True if `detail` is already a contract-shaped dict (from guardrails or RBAC).
    These pass through unchanged — no double-wrapping.
    """
    return isinstance(detail, dict) and "code" in detail and "details" in detail
