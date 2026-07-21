---
task: N2-regressions
branch: task/N2-regressions
status: done
loop_step: 6-done
last_verified: |
  2026-07-21 — 29/29 PASSED (22 smoke + 4 enforcement + 3 regressions)
  frontend: 303/303 PASSED (npx jest)
  backend unit: 41/41 PASSED (uv run pytest backend/tests/)
  integration: 29/29 PASSED (uv run pytest ../tests/ via PID 31600)

  ============================= test session info =============================
  tests/test_regressions.py::TestRegressions::test_dotenv_loaded_before_auth_import PASSED
  tests/test_regressions.py::TestRegressions::test_provenance_downgrade_accepts_string_input PASSED
  tests/test_regressions.py::TestRegressions::test_rbac_denial_writes_audit_row_with_denial_reason PASSED
  [+ 22 smoke + 4 enforcement all PASSED — see N2-enforcement-tests.state.md]
  ======================== 29 passed, 4 warnings in 60.34s ===================

agent_log:
  - "2026-07-21: Merge-gate audit confirmed N2 deviation — gate ran only on task-branch HEAD,
     not merge-result commit. frontend 303 and backend 41 unit suites not run at N2 merge time.
     All three suites confirmed on trunk HEAD 3e95678: 303/303, 41/41, 26/26."
  - "2026-07-21: Wrote tests/test_regressions.py — R01 (dotenv-ordering), R02
     (provenance-string-cast), R03 (rbac-audit-gap). Each test names the bug it locks in
     its docstring. No source changes — fixture-only, all HTTP against running server."
  - "2026-07-21: Appended deviation note to N2-enforcement-tests.state.md decisions.
     Appended Deviation #12 to 00-environment-decisions.md (FULL gate definition + merge-result
     requirement). Hardened autopilot-pack §1 INTEGRATION GATE RULE with merge-result procedure."
  - "2026-07-21: 29/29 PASSED on task branch (uvicorn PID 31600). All 3 regression tests green
     first run."

next_action: merged to trunk

decisions:
  - "Regression test approach: all three tests are HTTP integration tests against the live server.
     This is correct — the bugs lived at the HTTP boundary (JWT decode, route handler, exception
     handler). A unit test would not catch R01 because the bug was in the server process's import
     order, not in any importable function."
  - "No changes to test_enforcement.py — regression tests are additive, not replacements.
     N2 enforcement tests prove 'Phase 1 enforces'; regression tests lock 'the bugs that
     broke Phase 1 before the fix'. Both are necessary."
  - "Gate hardening: 00-environment-decisions.md Deviation #12 + autopilot-pack §1 update
     together form the binding rule. Future sessions must run all three suites on the
     merge-result commit before pushing. No exception #3."

metrics:
  tool_calls_used: 28 (budget 40)
  gate_runs: 1  gate_failures: 0
  tests_added: 3  tests_strengthened: 0  tests_weakened: 0
---
