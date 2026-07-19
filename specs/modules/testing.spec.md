# Spec: Testing (aspect 7)

## Measured baseline (2026-07-19, feat/ui-revamp-v4 — reproduce before trusting)
- Expo Jest: 250 tests (243 green; 7 stale theme-identity tests → Task 01)
- Web Playwright: 67 tests / 3 spec files (needs browsers + running app)
- Backend: 22 live-server integration tests; **zero unit tests** — every new backend module
  ships its own unit suite (Tasks 02+)
- Scaffold heritage: 12 Jest (rbac/audit/validation patterns) + 25 pytest
  (provenance/guardrails/dedup) — these port with their code
- maaxly: test config broken (all suites SyntaxError) — quarantined; never inherit its setup

## The pyramid, per layer
| Layer | Unit | Integration | E2E |
|---|---|---|---|
| backend | every module (new) | 22 existing + per-route contract tests | — |
| agent-service | provenance/guardrails/dedup (exist) | orchestrator w/ mocked sub-agents & mocked tool failures | — |
| web | component logic | — | Playwright: happy + failure matrix |
| frontend | 250-suite, extended per screen | API-connection suite | Maestro/Detox later, not now |

## The failure matrix (every new E2E-touched feature covers all five)
malformed input (client blocks + inline errors) · network timeout (no hang; contract-shaped
toast) · expired auth (redirect or session-ended notice) · backend validation error (4xx payload
rendered on the right field) · success (confirmation surfaced). Transient elements asserted via
stable `data-test-id`, never CSS classes.

## Hard rules
1. Red before green: a task's tests exist and fail correctly before implementation (loop step 2).
2. The gate is the FULL suite, not the task's suite. Green-in-worktree ≠ done (spec-system §C).
3. Real incidents become permanent regression tests (the Maaxly-contradiction test is the
   template; the 7 stale theme tests become theme-change-discipline tests after Task 01).
4. A flaky test is a bug with priority: quarantine + ticket same day, never retry-until-green.
5. Integration tests requiring live services declare it in a header comment and are skipped
   (loudly, with reason) when services are absent — an environmental fail must never be
   confusable with a logic fail (this session's backend-test confusion is the motivating case).
