# 04 — Audit Extraction Module

## GOAL
Migrate the inline `AuditLog` model and `log_audit_event` function from `backend/server.py` into
a standalone `backend/audit.py` module. Extend the schema to carry the fields required by
`audit-log.spec.md` (actor, action, resource, result, denial_reason ← `request.state.audit_denial_reason`
from T02, request_id) and update every existing call site. Zero behavior loss — all existing
audit events must continue to write identical data; new fields may be added.

After this task, `backend/audit.py` is the canonical audit module. `server.py` imports from it.
No audit logic remains inline in `server.py`.

## MODULE SPECS
- `reference/scaffold/specs/audit-log.spec.md` — schema hard rules 1-4 (append-only, log before
  action, separate storage, one-query weekly answer)
- `reference/scaffold/backend/src/middleware/auditLog.js` — scaffold implementation (verified on
  disk; `record`, `readAll`, Express middleware)
- `specs/modules/observability.spec.md` rules 1-2 (every agent call traced; request_id correlates
  audit ↔ Opik trace ↔ error payload)
- `specs/modules/validation-error-handling.spec.md` (request_id in every response — same uuid
  that appears in the audit entry)

## REUSE MAP
**Authoritative source (verified on disk):**
- `reference/scaffold/backend/src/middleware/auditLog.js` — field names, append-only pattern,
  middleware structure
- `backend/server.py` lines 214-252 — existing `AuditLog` model + `log_audit_event` function
  (read before implementing — extract verbatim, then extend)

**Scaffold fields (port as-is):**

| Field | Type | Notes |
|---|---|---|
| `timestamp` | ISO-8601 datetime | already in AuditLog |
| `actor` | str | currently `user_id`; rename/add — see Decision note |
| `action` | str | already `action` |
| `resource` | str | compose from `resource_type` + optional `resource_id` |
| `result` | "success" \| "denied" \| "error" | derive from `success` bool + new `result` arg |
| `denial_reason` | Optional[str] | ← `request.state.audit_denial_reason` (T02) |
| `request_id` | str | already generated in guardrails_content_check; add to AuditLog |

**Existing fields to keep (backwards compat with existing Mongo documents):**
- `id`, `user_id`, `resource_type`, `resource_id`, `ip_address`, `user_agent`, `details`, `success`
  (keep all; add new fields alongside — Mongo schema is flexible)

## SCHEMA EXTENSION
```python
class AuditLog(BaseModel):
    # --- existing fields (keep verbatim) ---
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    ip_address: str
    user_agent: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    details: Dict[str, Any] = {}
    success: bool = True
    # --- new fields (scaffold-sourced) ---
    actor: Optional[str] = None       # role string (owner / agent:* / unauthenticated)
    resource: Optional[str] = None    # composed: f"{resource_type}:{resource_id}" or resource_type
    result: str = "success"           # "success" | "denied" | "error"
    denial_reason: Optional[str] = None  # from request.state.audit_denial_reason (T02)
    request_id: Optional[str] = None  # correlates to guardrail/error request_id
```

## FUNCTION SIGNATURE EXTENSION
```python
async def log_audit_event(
    action: str,
    resource_type: str,
    request: Request,
    user_id: Optional[str] = None,
    resource_id: Optional[str] = None,
    details: Dict[str, Any] = None,
    success: bool = True,
    # new:
    actor: Optional[str] = None,
    result: Optional[str] = None,       # if None, derived from success bool
    denial_reason: Optional[str] = None, # if None, read from request.state.audit_denial_reason
    request_id: Optional[str] = None,
) -> None: ...
```

Backwards-compatible: all existing call sites pass positional args up to `success`; new kwargs
default to None and are auto-filled where possible (denial_reason from request.state, result
derived from success, actor from request.state if T02 sets it).

## TDD CONTRACT
**Unit tests** (`backend/tests/test_audit.py` — no live server, pure logic):

1. `test_audit_log_schema_has_required_fields` — AuditLog model has all scaffold fields: actor,
   action, resource, result, denial_reason, request_id
2. `test_audit_log_result_defaults_to_success` — `result` defaults to "success"; setting
   `success=False` with no explicit result sets result to "denied"
3. `test_audit_log_resource_composed_from_type_and_id` — `resource` is composed as
   `"resource_type:resource_id"` when resource_id is present, else just `resource_type`
4. `test_audit_log_denial_reason_populated_from_request_state` — when `request.state` has
   `audit_denial_reason`, `log_audit_event` picks it up without explicit kwarg
5. `test_audit_log_has_request_id` — when `request_id` is passed, it appears in the stored entry
6. `test_append_only_no_update_or_delete_route_in_audit_module` — AST check: `audit.py` exposes
   no function named `update`, `delete`, `patch`, `remove`, or `modify`
7. `test_log_audit_event_does_not_raise_on_db_failure` — mock db raises; `log_audit_event` catches
   and logs error without re-raising (matches existing behavior)

**Integration** (existing 22-test suite must still pass — zero behavior loss):
- All existing audit write calls in server.py work unchanged after the refactor.
- The `AuditLog` model and `log_audit_event` imported from `audit.py` must be drop-in replacements.

## GUARDRAIL-PROVENANCE
- `AuditLog` schema and field names: ported from `reference/scaffold/specs/audit-log.spec.md`
  and `reference/scaffold/backend/src/middleware/auditLog.js` (verified on disk).
- Schema extension (keeping existing fields): migration compatibility — Mongo documents already
  in the collection use the old shape; new fields are Optional with defaults.
- `denial_reason` auto-population: uses `request.state.audit_denial_reason` set by T02's
  `check_permission` function — this is the only inter-task dependency (T04 reads T02's output).

## FILE SCOPE
ONLY these paths may be modified:
- `backend/audit.py` (new)
- `backend/tests/test_audit.py` (new)
- `backend/server.py` — ONLY to replace inline AuditLog class + log_audit_event with
  `from audit import AuditLog, log_audit_event` and remove the now-moved code. No other changes.
- `specs/tasks/04-audit-extraction.state.md`
- `specs/tasks/04-audit-extraction-decisions.md`

## OUT OF SCOPE
- Audit read/query routes (T04 is extraction + schema extension only; analytics route already
  exists in server.py and is not touched)
- Opik trace wiring (Task 08)
- Frontend audit display (no frontend changes)
- Separate storage backend (MongoDB is already separate from the graph; spec rule 3 satisfied)

## PARALLEL SAFETY
T04 touches `server.py` (removal of inline audit code + import). T05 also touches `server.py`
(exception handlers). These are different sections; a trivial merge conflict is possible.
T04 must merge before T05 starts (T05 imports from audit.py for request_id in error responses).

## DONE MEANS
- `uv run pytest backend/tests/test_audit.py -v` — all 7 unit tests pass
- `uv run pytest tests/ -q` — all 22 integration tests still pass (with server+Mongo up)
- `AuditLog` and `log_audit_event` no longer defined in `server.py` — imported from `audit.py`
- `04-audit-extraction-decisions.md` written: field migration rationale, backwards-compat
  choice, denial_reason auto-population design
- State file updated to `done`, branch pushed to `origin/task/04-audit-extraction`
- Merge gate: full suite run on merge result into `feat/ui-revamp-v4`
