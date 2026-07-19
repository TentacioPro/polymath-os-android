# 03 — Guardrails Module

## GOAL
Create `backend/guardrails.py` with four named checks ported from the agent-service scaffold
heritage (testing.spec.md: "25 pytest provenance/guardrails/dedup — these port with their
code"). Wire as a FastAPI dependency at the validate layer, after RBAC.

After this task, every mutation route enforces: authenticate → rbac → **guardrails** → validate
→ audit → handler → audit (system-design.spec.md rule 2; guardrails sit inside validate).

## MODULE SPECS
- `specs/modules/validation-error-handling.spec.md` (guardrail_flag / guardrail_reject error
  codes and payload shape; evidence in `details[]`)
- `specs/modules/system-design.spec.md` rule 4 (agent-service re-checks guardrails; backend
  is primary enforcement, agent-service is defense-in-depth)
- `specs/modules/security.spec.md` (guardrails are not a substitute for RBAC — separate layers)
- `specs/modules/observability.spec.md` rule 1 (guardrail outcomes traced on every agent call)
- `specs/modules/testing.spec.md` (unit suite ships with the module)

## REUSE MAP
The four checks to port are from the scaffold agent-service heritage. **Implementation step 1
is to read the reference material** — check `reference/langgraphjs/kiro-js-conversion` for any
existing TS guardrail implementations and translate to Python. If none is found, derive from
the spec's named discrepancies below. The checks are:

| Check | Outcome | Trigger |
|---|---|---|
| `length_and_format` | reject | content > limit or structurally malformed |
| `unsupported_numbers` | flag | numeric claim with no cited source (e.g. "40% improvement") |
| `single_origin_repetition` | flag | same source cited ≥ 3 times in one input (artificial inflation) |
| `pii_detection` | flag or reject (configurable) | email / phone / SSN / financial account pattern detected |

Error shape (validation-error-handling.spec.md):
```json
{
  "code": "guardrail_flag",
  "details": [{"path": ["field"], "message": "Unsupported numeric claim: '40%' has no cited source"}],
  "request_id": "uuid"
}
```

## TDD CONTRACT
**Unit tests** (`backend/tests/test_guardrails.py` — no live server, pure logic):
- `test_length_check_rejects_oversized_content`
- `test_length_check_passes_normal_content`
- `test_unsupported_numbers_flags_bare_percentage`
- `test_unsupported_numbers_passes_cited_statistic`
- `test_single_origin_flags_triple_citation`
- `test_single_origin_passes_diverse_sources`
- `test_pii_flags_email_address`
- `test_pii_flags_phone_number`
- `test_pii_passes_clean_content`
- `test_guardrail_flag_produces_correct_error_shape`
- `test_guardrail_reject_produces_correct_error_shape`
- `test_all_checks_composable` — run_guardrails(content) returns list of results, not raises,
  so the route handler decides to flag-and-proceed or reject

**Integration** (existing 22-test suite must still pass):
- Guardrails in development mode: run checks but do NOT reject (flag only — same philosophy as
  rate limiter). Existing smoke tests must remain green with no auth payload changes.

## GUARDRAIL-PROVENANCE
- The four check definitions above are derived from validation-error-handling.spec.md's named
  discrepancies. If a more authoritative reference is found in the scaffold, it supersedes this
  spec and must be recorded in the decisions file.
- The PII regex patterns used must be cited (OWASP or RFC-based) in the decisions file.

## FILE SCOPE
ONLY these paths may be modified:
- `backend/guardrails.py` (new)
- `backend/tests/test_guardrails.py` (new)
- `backend/tests/__init__.py` (if not already created by T02)
- `backend/server.py` — ONLY to wire `run_guardrails` as a Depends on mutation routes.
  No other logic changes.
- `specs/tasks/03-guardrails-port.state.md`
- `specs/tasks/03-guardrails-port-decisions.md`

## OUT OF SCOPE
- Changing PII handling in storage (privacy-data-ownership.spec.md — separate task)
- Audit log extraction (Task 04)
- Agent-service side of guardrails (Task 08 scope — this task is the backend layer only)
- Any frontend changes

## PARALLEL SAFETY
FILE SCOPEs of T02 and T03 are disjoint:
- T02 touches: `rbac.py`, `tests/test_rbac.py`, targeted lines in `server.py` and `auth.py`
- T03 touches: `guardrails.py`, `tests/test_guardrails.py`, targeted lines in `server.py`
- The server.py changes are in different route decorators; a merge conflict is possible but
  resolved trivially by combining the Depends() lists. Flag if this occurs.

## DONE MEANS
- `uv run pytest backend/tests/test_guardrails.py -v` — all unit tests pass (no live server)
- `uv run pytest tests/ -q` — all 22 integration tests still pass (with server+Mongo up)
- `npx jest` in frontend/ — 303/303 still green
- `03-guardrails-port-decisions.md` written (which 4 checks, PII pattern source, rejected
  alternatives for each check, flag-vs-reject threshold rationale)
- State file updated to `done`, branch pushed to `origin/task/03-guardrails-port`
- Merge gate: full suite run on merge result into `feat/ui-revamp-v4`
