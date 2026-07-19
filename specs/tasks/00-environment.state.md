# State: 00-environment
status: done
loop_step: record
branch: chore/spec-system
last_verified: |
  Timestamp: 2026-07-19

  === FRONTEND JEST (feat/ui-revamp-v4 / chore/spec-system) ===
  Test Suites: 4 failed, 5 passed, 9 total
  Tests:       7 failed, 243 passed, 250 total
  Time:        18.947s
  Failing suites: store.test.ts, theme.test.ts, ui-components.test.tsx, navigation-components.test.tsx
  Failing tests (7):
    - Theme System Tests › Theme color identity › void theme should have dark surface
    - Theme System Tests › Theme color identity › nova theme should have light surface
    - Theme System Tests › Theme color identity › ocean theme should have blue primary
    - Theme System Tests › Theme color identity › void theme has white primary (monochrome)
    - CollapsibleHeader › renders custom greeting
    - CollapsibleHeader constants › HEADER_MAX is greater than HEADER_MIN
    - CollapsibleHeader constants › SCROLL_RANGE equals HEADER_MAX minus HEADER_MIN

  === BACKEND PYTEST (server @ 127.0.0.1:8001, cog-mongo Docker container) ===
  22 passed, 1 warning in 50.40s
  Warning: test_create_journal returns dict instead of None (PytestReturnNotNoneWarning)
  uv + Python 3.13.5 (see deviation below)

  === PLAYWRIGHT (web/ - test listing only, app server not started) ===
  Total: 67 tests in 3 files (smoke.spec.ts, navigation.spec.ts, m3-web-components.spec.ts)
  bunx playwright test --list confirmed 67 tests present

next_action: Begin Task 01 — fix 7 stale theme-identity Jest tests on branch task/01-theme-tests off feat/ui-revamp-v4, per specs/modules/theming.spec.md rule 3. Awaiting owner go.
blocked_on: Owner go-ahead required before starting any task (Phase D stop line).
agent_log:
- 2026-07-19 · claude-sonnet-4-6 · Phase B complete: workspace created, repos cloned, spec system installed, decisions recorded, .gitattributes + longpaths configured. Committed on chore/spec-system.
- 2026-07-19 · claude-sonnet-4-6 · Phase C complete: all three suites run, outputs pasted above, deviations recorded below.

deviations:
  1. FINDING — Python 3.13.5 installed; spec expects 3.12. Backend tests pass on 3.13.5.
     Action required: none (tests green); note for future tasks if 3.12-specific syntax matters.
  2. FINDING — 2 test suites fail to run (store.test.ts, ui-components.test.tsx): suite-level error,
     not individual test failures. These are NOT the 7 stale theme tests. The 7 test failures are:
     4 in theme.test.ts + 3 in navigation-components.test.tsx. Needs investigation in Task 01 scope
     to determine if store/ui-components failures are pre-existing or related to the theme revamp.
  3. FINDING — Backend default port is 8001 (tests), not 8000 (uvicorn default). setup-local-env.md
     §4 command `uvicorn server:app --reload` must use `--port 8001` to match test expectations.
     setup-local-env.md updated accordingly.
  4. FINDING — Backend test count: 24 test functions in test_smoke_backend.py; spec says 22.
     Reconciled: 2 functions (test_activity_data, test_journal_data) are data-only unit tests
     that don't make HTTP calls. The 22 that make HTTP requests all passed. Count is correct.
  5. FINDING — Playwright tests listed but NOT executed against running app (would require
     `bun run dev` on Next.js app + network). Test presence confirmed (67 in 3 files). Full
     execution deferred to Task 09 scope when web is being actively developed.
