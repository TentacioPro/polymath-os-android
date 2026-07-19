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
**Authoritative source (verified on disk — read before implementing):**
- `reference/scaffold/backend/src/middleware/rbac.js` — verified ✓ (read in full 2026-07-19)
- `reference/scaffold/backend/src/__tests__/rbac.test.js` — verified ✓ (5 of 12 scaffold Jest tests)
- Scaffold backend suite: 12/12 green before porting (confirmed 2026-07-19)

**Port the structural pattern from scaffold — do not re-derive from spec prose.**

### Key patterns from scaffold (translate JS → Python):

**1. Data-driven matrix (not if/elif branching):**
```js
// scaffold JS pattern — port structure, not syntax
const PERMISSIONS = {
  owner: ['read', 'write_staged', 'commit', 'modify_schema', 'read_audit', 'grant_role'],
  'agent:read_only': ['read'],
  'agent:staged_write': ['read', 'write_staged'],
};
```
Our Python equivalent uses the same dict-of-lists pattern with our action names (see matrix below).

**2. Deny-by-default for unknown roles:**
```js
const allowed = PERMISSIONS[identity.role] || [];  // unknown role → empty list → denied
```

**3. auditDenialReason on every denial (REQUIRED — feeds audit trail):**
```js
req.auditDenialReason = `role '${identity.role}' lacks '${requiredAction}'`;
req.auditDenialReason = 'role escalation attempt by non-owner identity';
```
Python equivalent: set `request.state.audit_denial_reason` before raising HTTPException.

**4. Escalation hard-stop (checked before permission matrix):**
```js
const ROLE_ESCALATION_ACTIONS = new Set(['grant_role']);
if (ROLE_ESCALATION_ACTIONS.has(requiredAction) && identity.role !== 'owner') → 403
```

**5. Missing/unauthenticated identity → 401 (not 403):**
```js
if (!identity || !identity.role) return res.status(401).json({...});
```

## ROLES & PERMISSION MATRIX (to encode)

**3 scaffold roles + 1 spec-added role:**
- `owner` — scaffold-sourced; full access to all actions
- `agent:read_only` — scaffold-sourced; read only
- `agent:staged_write` — scaffold-sourced; read + write_staged (writes land in staging queue, owner confirms)
- `agent:service` — **spec-ADDED** (not in scaffold); internal service-to-service; access to
  agent-specific endpoints only; must be recorded in `02-rbac-port-decisions.md`

**Actions (translated from scaffold flat names to our system's operations):**

| Action | owner | agent:read_only | agent:staged_write | agent:service |
|---|---|---|---|---|
| `read` | ✓ | ✓ | ✓ | — |
| `write_staged` | ✓ | — | ✓ | — |
| `write_commit` | ✓ | — | — | — |
| `delete` | ✓ | — | — | — |
| `export` | ✓ | — | — | — |
| `read_audit` | ✓ | — | — | ✓ |
| `grant_role` | ✓ | — | — | — |
| `agent_invoke` | ✓ | ✓ | ✓ | ✓ |

Matrix rule: any action not explicitly granted → denied. No implicit inheritance.
`grant_role` is escalation-guarded (escalation check runs BEFORE matrix lookup).

## TDD CONTRACT
**Unit tests** (`backend/tests/test_rbac.py` — no live server, no DB, pure logic):

Translate scaffold rbac.test.js structure (1–5), then add our system-specific tests (6–8):

1. `test_unauthenticated_returns_401` — missing identity/role → HTTPException 401 (scaffold test 1)
2. `test_agent_read_only_cannot_write_staged` — write_staged denied → 403 + audit_denial_reason set
   (scaffold test 2: "agent:read_only cannot write_staged → 403 with reason")
3. `test_agent_staged_write_can_write_staged` — write_staged allowed → no exception raised
   (scaffold test 3: "agent:staged_write CAN write_staged → 202")
4. `test_grant_role_escalation_blocked_for_non_owner` — agent:staged_write + grant_role → 403
   escalation reason; owner + grant_role → passes (scaffold test 4)
5. `test_no_agent_role_has_write_commit` — no agent:* role contains write_commit in PERMISSIONS
   (scaffold test 5: "No agent role contains 'commit'" — pure dict inspection, no request needed)
6. `test_owner_has_full_access` — owner passes all actions including grant_role
7. `test_agent_service_limited_to_audit_and_invoke` — agent:service blocked on read/write/delete/export
8. `test_missing_jwt_secret_raises_on_startup` — `verify_startup_config()` raises `RuntimeError`
   when JWT_SECRET_KEY is absent or equals the default literal "your-256-bit-random-secret-key-here"
9. `test_rbac_denied_produces_correct_error_shape` — HTTPException detail has
   `{"code": "rbac_denied", "details": [...], "request_id": "..."}` shape

10. `test_no_permissive_bypass_flag_exists` — assert that no env-based bypass flag, permissive
    mode toggle, or development-mode shortcut exists in rbac.py (import the module, inspect
    its module-level constants and check_permission function signature — no bypass path)

**Integration** (existing 22-test suite must still pass unchanged after wiring):
- Enforcement is identical in dev and prod. No env-based security bypass exists.
  The existing 22 smoke tests pass because the authenticated test user maps to role `owner`;
  public endpoints (health/root) carry no RBAC dependency.
  If any of the 22 tests break under enforcement, STOP and report which and why — do not add
  a bypass.

## GUARDRAIL-PROVENANCE
No provenance claims in this module. The permission matrix is owner-authored at task-spec time;
the structural pattern (data-driven dict, deny-by-default, auditDenialReason) is scaffold-sourced.
The `agent:service` role addition is spec-owned and must be justified in the decisions file.

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
- `uv run pytest backend/tests/test_rbac.py -v` — all 10 unit tests pass (no live server)
- `uv run pytest tests/ -q` — all 22 integration tests still pass (with server+Mongo up)
- `npx jest` in frontend/ — 303/303 still green (no regression)
- `02-rbac-port-decisions.md` written: data-driven matrix rationale, auditDenialReason pattern,
  agent:service role addition justification, rejected alternatives
- State file updated to `done`, branch pushed to `origin/task/02-rbac-port`
- Merge gate: full suite run on merge result into `feat/ui-revamp-v4`
