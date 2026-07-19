# 02 — RBAC Permission Module

## GOAL
Create `backend/rbac.py` as a standalone, testable module that encodes the system's
permission matrix as code (source of truth). Wire it into the FastAPI route chain at the
correct middleware position. Also fold in the JWT_SECRET_KEY hard-fail on startup (security.spec.md
rule 5) — it is a one-liner that belongs in this task's scope.

After this task, every backend route enforces: **authenticate → rbac → validate → audit →
handler → audit** (system-design.spec.md rule 2).

## MODULE SPECS
- `specs/modules/security.spec.md` rule 2 (RBAC roles + matrix, no self-escalation, owner-only grants)
- `specs/modules/system-design.spec.md` rule 2 (middleware order)
- `specs/modules/validation-error-handling.spec.md` (error shape for `rbac_denied`)
- `specs/modules/testing.spec.md` (every new backend module ships its own unit suite)

## REUSE MAP
- `backend/auth.py::get_current_user` — existing JWT dependency; RBAC wraps it, never replaces it
- `backend/auth.py::ACCESS_TOKEN_EXPIRE_MINUTES` — reference for token shape
- Testing heritage: testing.spec.md notes "12 Jest (rbac/audit/validation patterns)" from scaffold;
  port the structural pattern (role→resource→action matrix), not the JS test syntax

## ROLES & PERMISSION MATRIX (to encode)
Four roles from security.spec.md:
- `owner` — full access to all operations on all resources
- `agent:read_only` — read all resources; no writes, deletes, or exports of sensitive data
- `agent:staged_write` — write operations land in staging queue, owner must confirm
- `agent:service` — internal service-to-service; access to agent-specific endpoints only

Resource classes: `activity`, `journal`, `connection`, `memory`, `user`, `export`, `audit_log`

Operations: `read`, `write`, `delete`, `export`, `admin` (grant/revoke roles)

Matrix rule: if a role×operation×resource combination is not explicitly granted, it is denied.
No implicit inheritance. No role self-escalation (a role cannot grant itself higher permissions).

## TDD CONTRACT
**Unit tests** (`backend/tests/test_rbac.py` — no live server, no DB, pure logic):
- `test_owner_has_full_access` — owner passes all resource/operation combinations
- `test_agent_read_only_can_read_not_write` — agent:read_only blocked on write/delete/export
- `test_agent_staged_write_is_allowed_but_flagged` — staged_write routes to staging, not direct
- `test_agent_service_limited_to_service_endpoints` — service role blocked on user resources
- `test_no_role_self_escalation` — no role can grant itself owner
- `test_missing_jwt_secret_raises_on_startup` — `verify_startup_config()` raises `RuntimeError`
  when JWT_SECRET_KEY is missing or is the literal string "your-256-bit-random-secret-key-here"
- `test_rbac_denied_produces_correct_error_shape` — denied access raises HTTPException with
  `{"code": "rbac_denied", "details": [...], "request_id": "..."}` shape

**Integration** (existing 22-test suite must still pass unchanged after wiring):
- Existing smoke tests hit development mode where RBAC is in permissive mode (same as current
  rate limiting — skip in development), so they must remain green

## GUARDRAIL-PROVENANCE
No provenance claims in this module. The permission matrix is owner-authored at task-spec time.

## FILE SCOPE
ONLY these paths may be modified:
- `backend/rbac.py` (new)
- `backend/tests/__init__.py` (new — make tests/ a package if not already)
- `backend/tests/test_rbac.py` (new)
- `backend/server.py` — ONLY to: add `verify_startup_config()` call at startup, add rbac
  dependency to routes. No other changes to server.py logic.
- `backend/auth.py` — ONLY to: add hard startup failure for unset/default JWT_SECRET_KEY
- `specs/tasks/02-rbac-port.state.md`
- `specs/tasks/02-rbac-port-decisions.md`

## OUT OF SCOPE
- Changing Pydantic models or route handler logic
- Frontend / web changes
- Audit log module (Task 04 scope)
- Multi-tenant or cross-user RBAC (single-owner system; agent roles are the target)

## DONE MEANS
- `uv run pytest backend/tests/test_rbac.py -v` — all unit tests pass (no live server)
- `uv run pytest tests/ -q` — all 22 integration tests still pass (with server+Mongo up)
- `npx jest` in frontend/ — 303/303 still green (no regression)
- `02-rbac-port-decisions.md` written (role design rationale, rejected alternatives)
- State file updated to `done`, branch pushed to `origin/task/02-rbac-port`
- Merge gate: full suite run on merge result into `feat/ui-revamp-v4`
