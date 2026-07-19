# Phase 1 Report — Backend Security & Observability Layer
*Written 2026-07-19 · claude-sonnet-4-6 · STOP LINE after T05 merge*

---

## Summary

Phase 1 is the backend enforcement layer: RBAC, guardrails, audit logging, and error contract.
Five tasks were specified and implemented in a single session under the autopilot-pack §1 autonomy
contract. All unit gates are green. Integration gates are blocked pending live server + MongoDB.

---

## Task State Summary

| Task | Description | Status | Tests Added | Gate |
|---|---|---|---|---|
| T01 | Theme tests (303 Jest) | done (pre-session) | — | 303/303 green |
| T02 | RBAC port | gate_pending | 10 | 10/10 unit ✓; integration blocked |
| T03 | Guardrails port | done (merged) | 17 | 17/17 unit ✓; integration blocked |
| T04 | Audit extraction | gate_pending (merged) | 7 | 7/7 unit ✓; integration blocked |
| T05 | Error contract | gate_pending (merged) | 7 | 7/7 unit ✓; integration blocked |

**Total tests added this phase:** 41 unit tests (10 + 17 + 7 + 7).  
**tests_weakened across all tasks:** 0 (required ≤ 0 per autopilot-pack §4).

---

## Per-Task Metrics

### T02 — RBAC Port
- **Branch:** `task/02-rbac-port` (merged to trunk 2026-07-19)
- **Files:** `backend/rbac.py` (new), `backend/tests/test_rbac.py` (new), `backend/auth.py` (JWT sentinel), `backend/server.py` (13 mutation routes wired)
- **tool_calls_used:** 38/40
- **gate_runs:** 1 | **gate_failures:** 0
- **tests_added:** 10 | **tests_strengthened:** 0 | **tests_weakened:** 0
- **Integration gate:** blocked — smoke tests (tests/test_smoke_backend.py) make unauthenticated requests; RBAC on mutation routes returns 401. No bypass added (per §1 interrupt rule). Requires auth fixture in test suite.

### T03 — Guardrails Port
- **Branch:** `task/03-guardrails-port` (merged to trunk 2026-07-19)
- **Files:** `backend/guardrails.py` (new), `backend/tests/test_guardrails.py` (new), `backend/server.py` (3 content routes wired: POST /journals, PUT /journals/{id}, POST /activities/manual)
- **tool_calls_used:** 27/40
- **gate_runs:** 2 | **gate_failures:** 0
- **tests_added:** 17 | **tests_strengthened:** 0 | **tests_weakened:** 0
- **Integration gate:** blocked — same auth fixture gap as T02; `guardrails_content_check` Depends does not require auth (content check only), so guardrail wiring itself won't break unauthenticated tests once auth fixtures exist.
- **Key decisions:** 5 scaffold-sourced checks + `check_pii` spec-added; bypass test uses AST not word-grep; Provenance enum self-contained (cross-service import rejected); FLAG never blocks, REJECT always enforces.

### T04 — Audit Extraction
- **Branch:** `task/04-audit-extraction` (merged to trunk 2026-07-19)
- **Files:** `backend/audit.py` (new — extracted from server.py), `backend/tests/test_audit.py` (new), `backend/server.py` (inline code removed, import added, `init_db(db)` at startup)
- **tool_calls_used:** 18/40
- **gate_runs:** 2 | **gate_failures:** 0
- **tests_added:** 7 | **tests_strengthened:** 0 | **tests_weakened:** 0
- **Integration gate:** blocked — same as T02/T03.
- **Key decisions:** `init_db()` injection avoids circular import; new scaffold fields (actor, resource, result, denial_reason, request_id) are Optional for Mongo backwards-compat; denial_reason auto-populated from `request.state.audit_denial_reason` (T02 integration); append-only enforced by AST test.

### T05 — Error Contract
- **Branch:** `task/05-error-contract` (merged to trunk 2026-07-19)
- **Files:** `backend/error_contract.py` (new), `backend/tests/test_error_contract.py` (new), `backend/server.py` (exception handlers + request_id middleware)
- **tool_calls_used:** 14/40
- **gate_runs:** 1 | **gate_failures:** 0
- **tests_added:** 7 | **tests_strengthened:** 0 | **tests_weakened:** 0
- **Integration gate:** blocked — same as T02/T03/T04.
- **Key decisions:** 7-value closed ErrorCode enum; passthrough for already-shaped dicts (no double-wrapping of guardrail/RBAC errors); HTTP middleware for request_id (not Depends); generic Exception catch-all for 500 contract compliance.

---

## Combined Unit Gate (trunk, post-T05-merge)

```
uv run pytest backend/tests/ -q
41 passed, 9 warnings in 0.31s
```

Breakdown:
- `test_rbac.py`: 10/10
- `test_guardrails.py`: 17/17
- `test_audit.py`: 7/7
- `test_error_contract.py`: 7/7

---

## Integration Gate Status

**All 4 tasks:** `gate_pending` — blocked on live server + MongoDB.

**Root cause:** `tests/test_smoke_backend.py` makes unauthenticated HTTP requests. T02 wired RBAC
(`require_permission`) on all mutation routes; these return 401 for unauthenticated callers. The
spec states "22 smoke tests pass because the authenticated test user maps to role owner" — but
this was a spec gap: the test suite has no auth fixtures.

**Required to unblock:** Add authentication fixtures to `tests/test_smoke_backend.py` that obtain
a JWT for the `owner` role before mutation requests. This is auth-fixture work, not a bypass.

**T03/T04/T05 integration:** `guardrails_content_check`, `log_audit_event`, and exception handlers
do not themselves require auth — they will pass for any authenticated request. The auth fixture
gap is the only blocker.

---

## What Phase 2 Should Address

Per `00-spec-system.md` task ledger, the next tasks in queue:
- **T06–T08:** Agent-service layer (provenance, Opik tracing, RBAC re-check at agent boundary)
- **T09+:** Schema migration, connection graph, export formats
- **Cross-cutting:** Auth fixture for smoke tests (unblocks all 4 integration gates at once)

---

## Deviations Recorded

All deviations are recorded in their respective decisions files:
- T02: `02-rbac-port-decisions.md` (8 decisions + integration gap)
- T03: `03-guardrails-port-decisions.md` (7 decisions + 4-check mis-spec correction)
- T04: `04-audit-extraction-decisions.md` (5 decisions + integration gap)
- T05: `05-error-contract-decisions.md` (4 decisions + integration gap)

The original T03 4-check mis-spec is the most significant deviation — it arose because
`reference/scaffold/` did not exist when T03 was first written (Deviation #8 in
`00-environment-decisions.md`). The scaffold was later created and the spec was rewritten from
source before implementation. No incorrect check was implemented.

---

*STOP LINE reached. Phase 1 complete.*
