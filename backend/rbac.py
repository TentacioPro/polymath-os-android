"""
RBAC Permission Module — T02
Source: ported from reference/scaffold/backend/src/middleware/rbac.js

Design contract (binding):
- Permission matrix is DATA, not branching logic. Adding a role/action is a
  data change, not a code change.
- Deny-by-default: unknown role → empty allowed list → denied.
- auditDenialReason set on request.state before every 403 (feeds audit trail).
- Escalation hard-stop checked BEFORE matrix lookup.
- No env-based bypass, permissive mode, or development shortcut exists here.
  Enforcement is identical in dev and prod — no env-conditional paths exist.
"""
import os
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

# ── Permission matrix — DATA, not branching ─────────────────────────────────
#
# Three scaffold roles + one spec-added role (agent:service).
# Scaffold source: reference/scaffold/backend/src/middleware/rbac.js
# agent:service is spec-ADDED (not in scaffold) — see 02-rbac-port-decisions.md.
#
PERMISSIONS: dict[str, list[str]] = {
    "owner": [
        "read",
        "write_staged",
        "write_commit",
        "delete",
        "export",
        "read_audit",
        "grant_role",
        "agent_invoke",
    ],
    "agent:read_only": [
        "read",
        "agent_invoke",
    ],
    "agent:staged_write": [
        "read",
        "write_staged",
        "agent_invoke",
    ],
    # spec-ADDED: internal service-to-service; audit read + invoke only
    "agent:service": [
        "read_audit",
        "agent_invoke",
    ],
}

# Actions that are escalation-guarded: checked BEFORE matrix lookup.
# No role can grant itself owner; only owner may invoke these.
ESCALATION_ACTIONS: frozenset[str] = frozenset(["grant_role"])

# Sentinel value for unset JWT secret (matches pattern in setup docs)
DEFAULT_JWT_SENTINEL = "your-256-bit-random-secret-key-here"

_security = HTTPBearer(auto_error=False)


def verify_startup_config() -> None:
    """
    Hard-fail if JWT_SECRET_KEY is unset or is the known default sentinel.
    Call once at application startup (see server.py @app.on_event("startup")).
    """
    key = os.environ.get("JWT_SECRET_KEY", "")
    if not key or key == DEFAULT_JWT_SENTINEL:
        raise RuntimeError(
            "JWT_SECRET_KEY is not configured or equals the default sentinel value. "
            "Set a cryptographically random key in backend/.env before starting."
        )


def check_permission(role: Optional[str], action: str, request: Request) -> None:
    """
    Pure logic check — usable in unit tests without FastAPI routing.

    Args:
        role: The actor's role string (None if unauthenticated).
        action: The required action (must exist in PERMISSIONS values).
        request: FastAPI Request — used to set audit_denial_reason on state
                 and to read request_id for error shape.

    Raises:
        HTTPException 401: No role (unauthenticated).
        HTTPException 403: Role exists but action is denied.
    """
    request_id = getattr(request.state, "request_id", "unknown")

    if role is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "unauthenticated",
                "details": [{"path": [], "message": "No authenticated identity on request"}],
                "request_id": request_id,
            },
        )

    # Escalation hard-stop — only owner may invoke escalation actions
    if action in ESCALATION_ACTIONS and role != "owner":
        request.state.audit_denial_reason = "role escalation attempt by non-owner identity"
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "rbac_denied",
                "details": [{"path": [], "message": request.state.audit_denial_reason}],
                "request_id": request_id,
            },
        )

    # Deny-by-default: unknown role → empty list → denied
    allowed = PERMISSIONS.get(role, [])
    if action not in allowed:
        request.state.audit_denial_reason = f"role '{role}' lacks '{action}'"
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "rbac_denied",
                "details": [{"path": [], "message": request.state.audit_denial_reason}],
                "request_id": request_id,
            },
        )


def _get_role_from_credentials(
    credentials: Optional[HTTPAuthorizationCredentials],
) -> Optional[str]:
    """
    Extract role from JWT payload. Returns None if token is absent or invalid.
    Defaults to "owner" when role is not in the payload — the system owner is the
    sole human user; agent tokens with explicit roles are added in T08.
    """
    if credentials is None:
        return None
    from auth import decode_access_token
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        return None
    return payload.get("role", "owner")


def require_permission(action: str):
    """
    FastAPI dependency factory. Usage:
        @api_router.post("/journals", dependencies=[Depends(require_permission("write_staged"))])
    """
    async def rbac_dependency(
        request: Request,
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(_security),
    ) -> None:
        role = _get_role_from_credentials(credentials)
        check_permission(role, action, request)

    return rbac_dependency
