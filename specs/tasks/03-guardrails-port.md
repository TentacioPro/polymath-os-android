# 03 — Guardrails Module

## GOAL
Create `backend/guardrails.py` with five named checks ported from the agent-service scaffold
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
**Authoritative source (verified on disk — read before implementing):**
- `reference/scaffold/agent-service/app/agent_layer/guardrails.py` — verified ✓ (five checks,
  GuardrailOutcome enum, GuardrailResult dataclass, _NUMBER_PATTERN regex)
- `reference/scaffold/agent-service/tests/test_guardrails.py` — verified ✓ (10 tests, all pass
  in 0.04s against scaffold; confirmed 2026-07-19)

**Port directly from scaffold source — do not re-derive from spec prose.**

### Core types (port verbatim from scaffold):
```python
class GuardrailOutcome(str, Enum):
    PASS = "pass"
    FLAG = "flag"
    REJECT = "reject"

@dataclass
class GuardrailResult:
    outcome: GuardrailOutcome
    reason: str = ""
    details: dict = field(default_factory=dict)
```

### The five checks (scaffold-sourced):

| Check | Outcome | Trigger |
|---|---|---|
| `check_quantified_claims(output_text, source_text)` | FLAG | Numeric claim (%, $, large-user-counts) present in output but NOT in source — unsupported quantified claim |
| `check_provenance_downgrade(claimed, actual)` | REJECT | claimed provenance level > actual level (e.g. VERIFIED_ARTIFACT claimed when actual is AI_GENERATED_UNVERIFIED) |
| `check_cross_document_consistency(claim_sources)` | FLAG | Same claim repeated across documents tracing to a SINGLE origin — repetition is not corroboration (artificial inflation via same-session-origin) |
| `check_external_output_eligible(provenance)` | REJECT | Content with provenance AI_GENERATED_UNVERIFIED routed to external-facing output |
| `check_status_claim_against_later_evidence(status_claim, status_date, contradicting_doc_date, contradicting_doc_summary)` | FLAG | Status claim pre-dates a contradicting document (motivating case: Oct AWS resume vs Nov GCP doc) |

Provenance level ordering (scaffold):
`AI_GENERATED_UNVERIFIED` < `STRUCTURALLY_EVIDENCED` < `VERIFIED_ARTIFACT`

### Spec-added check (NOT in scaffold — must be justified in decisions file):

| Check | Outcome | Trigger |
|---|---|---|
| `check_pii(content, mode)` | FLAG or REJECT (configurable via mode) | email / phone / SSN / financial-account pattern detected |

The PII regex patterns used MUST be cited (OWASP or RFC-based) in `03-guardrails-port-decisions.md`.

### Number pattern (port from scaffold):
```python
_NUMBER_PATTERN = re.compile(
    r"\b\d{1,3}(?:\.\d+)?%|\$[\d,]+(?:\.\d+)?|\b\d{2,}\+?\s?(?:users|concurrent)"
)
```

### Error shape (validation-error-handling.spec.md):
```json
{
  "code": "guardrail_flag",
  "details": [{"path": ["field"], "message": "Unsupported quantified claim: '70%' appears in output but not in source"}],
  "request_id": "uuid"
}
```

## TDD CONTRACT
**Unit tests** (`backend/tests/test_guardrails.py` — no live server, pure logic):

Translate all 10 scaffold tests (1–10) from `test_guardrails.py` (the guardrails portion of the
25-test agent-service suite), then add spec-added pii + shape + composability + bypass check (11–17):

1. `test_unsupported_quantified_claim_is_flagged` — "70% improvement" in output, not in source → FLAG
2. `test_supported_quantified_claim_passes` — "96% uptime" in both output and source → PASS
3. `test_provenance_downgrade_is_rejected` — VERIFIED_ARTIFACT claimed, AI_GENERATED_UNVERIFIED actual → REJECT
4. `test_matching_provenance_passes` — claimed == actual → PASS
5. `test_same_origin_repetition_is_flagged_not_trusted` — same session-origin cited 3× → FLAG
6. `test_independently_sourced_claim_passes` — distinct sources → PASS
7. `test_ai_generated_unverified_cannot_reach_external_output` — AI_GENERATED_UNVERIFIED + external → REJECT
8. `test_verified_artifact_can_reach_external_output` — VERIFIED_ARTIFACT + external → PASS
9. `test_maaxly_status_claim_regression` — Oct AWS status claim vs Nov GCP contradicting doc → FLAG
   (this is the motivating real incident; must be a permanent regression test per testing.spec.md rule 3)
10. `test_status_claim_with_no_later_contradiction_passes` — no contradicting doc → PASS
11. `test_pii_flags_email_address` — "user@example.com" in content → FLAG
12. `test_pii_flags_phone_number` — "+1-555-867-5309" in content → FLAG
13. `test_pii_passes_clean_content` — no PII patterns → PASS
14. `test_guardrail_flag_produces_correct_error_shape` — result has code="guardrail_flag", details[], request_id
15. `test_guardrail_reject_produces_correct_error_shape` — result has code="guardrail_reject", details[], request_id
16. `test_all_checks_composable` — `run_guardrails(payload)` returns list[GuardrailResult]; does NOT raise;
    route handler inspects list and decides to flag-and-proceed or reject

17. `test_no_permissive_bypass_flag_exists` — assert that no env-based bypass flag or
    development-mode shortcut exists in guardrails.py (import the module, inspect module-level
    constants — no bypass path)

**Integration** (existing 22-test suite must still pass):
- Enforcement is identical in dev and prod. No env-based security bypass exists.
  FLAG-class checks never block (they annotate the response + audit entry and allow the request
  through). REJECT-class checks always enforce where wired; checks are wired per-route only
  where their required inputs exist.
  The existing 22 smoke tests pass because the authenticated test user maps to role `owner`;
  public endpoints carry no guardrail dependency.
  If any of the 22 tests break under enforcement, STOP and report which and why — do not add
  a bypass.

## GUARDRAIL-PROVENANCE
- Checks 1–5 are ported from `reference/scaffold/agent-service/app/agent_layer/guardrails.py`
  (verified on disk 2026-07-19; scaffold suite 25/25 green before porting).
- `check_pii` is spec-ADDED — not in scaffold. Rationale and pattern source must be recorded in
  `03-guardrails-port-decisions.md`.
- The original T03 spec named `length_and_format` and `pii_detection` (4 checks). These were
  WRONG — derived from spec prose without reading the scaffold source. Deviation #8 in
  `00-environment-decisions.md`. This rewritten spec supersedes the original entirely.

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
- PII handling in storage (privacy-data-ownership.spec.md — separate task)
- Audit log extraction (Task 04)
- Agent-service side of guardrails (Task 08 scope — this task is backend layer only)
- Any frontend changes

## PARALLEL SAFETY
FILE SCOPEs of T02 and T03 are disjoint:
- T02 touches: `rbac.py`, `tests/test_rbac.py`, targeted lines in `server.py` and `auth.py`
- T03 touches: `guardrails.py`, `tests/test_guardrails.py`, targeted lines in `server.py`
- The server.py changes are in different route decorators; a merge conflict is possible but
  resolved trivially by combining the Depends() lists. Flag if this occurs.

## DONE MEANS
- `uv run pytest backend/tests/test_guardrails.py -v` — all 17 unit tests pass (no live server)
- `uv run pytest tests/ -q` — all 22 integration tests still pass (with server+Mongo up)
- `npx jest` in frontend/ — 303/303 still green
- `03-guardrails-port-decisions.md` written: which 5 checks (scaffold-sourced), check_pii
  rationale + PII regex source, rejected alternatives for each check,
  flag-vs-reject threshold rationale, record of original 4-check mis-spec and correction
- State file updated to `done`, branch pushed to `origin/task/03-guardrails-port`
- Merge gate: full suite run on merge result into `feat/ui-revamp-v4`
