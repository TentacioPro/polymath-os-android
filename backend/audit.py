"""
audit.py — Audit logging module (T04).

Extracted from server.py (inline AuditLog + log_audit_event) and extended with
scaffold-sourced fields: actor, resource, result, denial_reason, request_id.

Scaffold source: reference/scaffold/backend/src/middleware/auditLog.js
Spec: reference/scaffold/specs/audit-log.spec.md (hard rules 1-4)
Observability: specs/modules/observability.spec.md rule 1

Hard rules (from spec):
- Append-only: this module exposes no update/delete/patch/remove/modify function.
- Logging happens before the action, not after (caller responsibility).
- denial_reason auto-populated from request.state.audit_denial_reason if not passed (T02).
- request_id correlates audit entry ↔ error payload ↔ Opik trace (T08).

Usage:
    # In server.py startup:
    from audit import AuditLog, log_audit_event, init_db
    init_db(db)  # call once after Motor client is ready

    # All existing callers remain unchanged:
    await log_audit_event("CREATE", "journal", request, user_id=uid)
"""
import logging
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from fastapi import Request
from pydantic import BaseModel, Field

from auth import get_client_info

# Module-level db reference — set once at startup via init_db().
# Avoids circular imports with server.py (which defines the Motor client).
_db = None


def init_db(db) -> None:
    """Register the Motor database instance. Call once at server startup."""
    global _db
    _db = db


class AuditLog(BaseModel):
    """Audit log entry — append-only, never updated after write."""
    # ── existing fields (kept verbatim for Mongo compatibility) ──────────────
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    action: str                          # CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT
    resource_type: str                   # activity, journal, connection, user, auth
    resource_id: Optional[str] = None
    ip_address: str
    user_agent: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    details: Dict[str, Any] = {}
    success: bool = True
    # ── scaffold-sourced fields (audit-log.spec.md) ───────────────────────────
    actor: Optional[str] = None          # role string: owner / agent:* / unauthenticated
    resource: Optional[str] = None       # composed: "resource_type:resource_id" or resource_type
    result: str = "success"              # "success" | "denied" | "error"
    denial_reason: Optional[str] = None  # from request.state.audit_denial_reason (T02)
    request_id: Optional[str] = None     # correlates to guardrail/error request_id


async def log_audit_event(
    action: str,
    resource_type: str,
    request: Request,
    user_id: Optional[str] = None,
    resource_id: Optional[str] = None,
    details: Dict[str, Any] = None,
    success: bool = True,
    # ── new scaffold-sourced kwargs (backwards-compatible — all default None) ─
    actor: Optional[str] = None,
    result: Optional[str] = None,
    denial_reason: Optional[str] = None,
    request_id: Optional[str] = None,
) -> None:
    """
    Write one append-only audit entry to the database.

    Backwards-compatible: all existing callers pass positional args up to `success`
    and require no changes. New fields are auto-filled where possible:
    - denial_reason: read from request.state.audit_denial_reason if not passed (T02 RBAC)
    - result: derived from success bool ("success" / "denied") if not passed
    - actor: read from request.state.actor_role if available
    - request_id: read from request.state.request_id if available

    Does not raise — errors are logged and swallowed (same contract as the original).
    """
    try:
        ip_address, user_agent = get_client_info(request)

        # Auto-populate denial_reason from T02 RBAC state
        if denial_reason is None:
            denial_reason = getattr(getattr(request, "state", None), "audit_denial_reason", None)

        # Derive result from success bool
        if result is None:
            result = "success" if success else "denied"

        # Actor from request.state (set by require_permission in rbac.py)
        if actor is None:
            actor = getattr(getattr(request, "state", None), "actor_role", None)

        # request_id from request.state (set by middleware or guardrails_content_check)
        if request_id is None:
            request_id = getattr(getattr(request, "state", None), "request_id", None)

        # Compose resource field (scaffold pattern: "type:id" or just "type")
        resource = f"{resource_type}:{resource_id}" if resource_id else resource_type

        audit_entry = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details or {},
            success=success,
            actor=actor,
            resource=resource,
            result=result,
            denial_reason=denial_reason,
            request_id=request_id,
        )
        if _db is not None:
            await _db.audit_logs.insert_one(audit_entry.model_dump())
    except Exception as e:
        logging.error(f"Failed to log audit event: {e}")
