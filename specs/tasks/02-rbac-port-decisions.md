# 02-rbac-port-decisions.md
*Written 2026-07-19 after implementation. Append-only.*

---

## Decision 1: Data-driven permission matrix (not if/elif branching)

**Chosen:** `PERMISSIONS: dict[str, list[str]]` — role maps to list of allowed actions. Unknown
role gets `PERMISSIONS.get(role, [])` → empty list → denied. Adding a role or action is a data
change, not a code change.

**Rejected:** if/elif chains per role (would require code edits for every new role; violates
scaffold spec hard rule "Permission matrix is DATA not branching logic").

**Source:** `reference/scaffold/backend/src/middleware/rbac.js` — ported verbatim in structure.

---

## Decision 2: auditDenialReason on every denial

**Chosen:** Set `request.state.audit_denial_reason` before every 403 raise. The reason string
identifies the specific cause ("role 'agent:read_only' lacks 'write_staged'"; "role escalation
attempt by non-owner identity"). This field feeds the audit trail (T04) and makes denied-access
incidents attributable.

**Rejected:** Raising 403 without setting reason (would make audit log entries non-attributable
— defeats the purpose of the RBAC layer).

**Source:** `req.auditDenialReason` pattern in scaffold `rbac.js` — translated to FastAPI
`request.state`.

---

## Decision 3: Escalation hard-stop checked before matrix lookup

**Chosen:** `ESCALATION_ACTIONS` checked FIRST, before `PERMISSIONS.get(role)`. If an escalation
action is attempted by a non-owner, the request is rejected immediately with the escalation
reason, regardless of what the matrix says.

**Rejected:** Encoding escalation denial inside the PERMISSIONS dict (would require grant_role to
be absent from non-owner rows; relies on absence rather than an explicit check; audit reason
would be generic "role X lacks grant_role" instead of the specific escalation message).

---

## Decision 4: agent:service role (spec-ADDED, not in scaffold)

**Chosen:** Add `agent:service` as a 4th role with `["read_audit", "agent_invoke"]` permissions.
Rationale: the system-design spec requires an internal service-to-service authentication path for
agent-service calls. The scaffold has only 3 roles (owner, agent:read_only, agent:staged_write).
`agent:service` fills the gap without expanding any agent role's privilege surface.

**Rejected:** Overloading `agent:read_only` for service calls (would expose user-data reads to
internal services; violated separation of concerns). Rejected: deferring to T08 entirely (T02
must encode the complete intended matrix; leaving agent:service out would require a
backwards-incompatible matrix change later).

**Justification recorded per spec requirement.**

---

## Decision 5: role defaults to "owner" when absent from JWT payload

**Chosen:** `_get_role_from_credentials` returns `payload.get("role", "owner")` — when the JWT
has no `role` field, default to "owner". Rationale: this is a single-owner system; only the
system owner currently has tokens (agents get tokens in T08 with explicit role fields). The
default-owner behavior is architecturally correct for the current state and will be overridden
once agent tokens carry explicit roles.

**Rejected:** Returning None for missing role (would break all existing authenticated routes
before T08 adds role to tokens — the system would be unusable). Rejected: adding role to all
existing tokens now (out of T02 scope; requires auth.py changes beyond the JWT hard-fail).

---

## Decision 6: JWT hard-fail sentinel value

**Chosen:** `verify_startup_config()` raises `RuntimeError` if `JWT_SECRET_KEY` is unset or
equals `"your-256-bit-random-secret-key-here"` — the value that appears in documentation/setup
guides. This exact string is rejected as a sentinel.

**Rejected alternative check:** Checking only for empty string (would miss the case where the
server starts with the documented default key — a real incident vector).

---

## Decision 7: No permissive/bypass mode — enforcement identical in dev and prod

**Chosen:** RBAC enforcement is unconditional. No `if ENVIRONMENT == "development"` guard,
no `SKIP_RBAC` flag, no permissive mode exists. The spec (after owner amendment 2026-07-19)
explicitly prohibits env-based security bypasses.

**Rejected:** "dev mode skips RBAC" (pattern found in `server.py`'s rate limiter — explicitly
called out as the bad pattern to avoid for security layers). The 22 smoke tests are expected to
pass because the test user maps to role `owner` (not because RBAC is disabled).

---

## Decision 8: AST-based bypass test (rejected word-grep)

**Chosen:** `test_no_permissive_bypass_flag_exists` uses Python's `ast` module to:
1. Assert no `os.environ`/`os.getenv` reads exist outside `verify_startup_config`.
2. Assert no `If` node whose condition references an env value exists inside
   `check_permission`/`require_permission`/`_get_role_from_credentials`.

**Rejected:** Source-code word-grep for "bypass", "permissive", "development" etc. (three edit
rounds spent policing docstring vocabulary — the test was catching documentation, not behavior;
a docstring saying "no bypass exists" would itself trigger the test). AST analysis catches real
bypass code while leaving comments and docstrings unconstrained.

**This design is mirrored in T03's test 17.**

---

## Known gap: Integration gate blocked (smoke tests are unauthenticated)

**Finding (2026-07-19):** The 22 smoke tests in `tests/test_smoke_backend.py` make HTTP calls
with NO auth headers. After wiring RBAC Depends on mutation routes, those tests will fail with
401 on: POST /activities/manual, POST /journals, DELETE /journals/{id}, POST /export/json,
POST /export/markdown, POST /export/csv, and other mutation routes.

**This is a spec contradiction:** The spec says "22 tests pass because test user maps to role
`owner`" — but the actual tests are unauthenticated.

**Resolution required (out of T02 scope):** The smoke test suite needs auth fixtures (register a
test user, obtain a JWT, set Authorization header on each client request). This is a test-suite
improvement task, not a bypass.

**T02 action:** Integration gate is `gate_pending`. Do NOT add a bypass. The unit suite is
10/10 green. Route wiring is complete and correct — the gap is in the smoke test suite.

**blocked_on:** smoke test auth fixtures (smoke tests need Bearer token on mutation requests
before integration gate can pass under RBAC enforcement).
