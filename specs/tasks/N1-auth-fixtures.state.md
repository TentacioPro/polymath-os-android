# State: N1-auth-fixtures
status: gate_pending
loop_step: gate
branch: task/auth-fixtures
last_verified: |
  backend/tests/ — 41/41 PASSED (2026-07-20)
  tests/test_smoke_backend.py — NOT RUN (no live server on port 8001 at commit time)
next_action: |
  Start cog-mongo + uvicorn (port 8001), then:
    uv run pytest tests/test_smoke_backend.py -v
  All 22 smoke tests should pass. On green: flip T02/T03/T04/T05 state files from
  gate_pending → done; append integration-gate-closed note to each decisions file.
blocked_on: live server + MongoDB (same as T02–T05; auth fixture is the fix)
agent_log:
  - 2026-07-20 claude-sonnet-4-6: implemented session-scoped auth_client fixture;
    six mutation tests switched from client → auth_client; 41/41 unit gate green;
    integration gate deferred (no server at commit time)

metrics:
  tool_calls_used: 18/40
  gate_runs: 1  gate_failures: 0
  tests_added: 0  tests_strengthened: 6  tests_weakened: 0
