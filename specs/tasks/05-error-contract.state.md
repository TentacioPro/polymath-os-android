# State: 05-error-contract
status: not_started
loop_step: read
branch: task/05-error-contract
last_verified: (none yet)
next_action: "Create worktree wt-05 (after T04 merges). Read validation-error-handling.spec.md, server.py exception handling, scaffold validateRequest.js. Write backend/error_contract.py with ErrorCode enum + make_error(), add exception handlers + request_id middleware to server.py, write 7 unit tests."
blocked_on: "T04 must merge first (T05 imports from audit.py for request_id correlation)"
agent_log:
- 2026-07-19 · claude-sonnet-4-6 · spec written; blocked on T04 merge

metrics:
  tool_calls_used: 0 (budget 40)
  gate_runs: 0  gate_failures: 0
  tests_added: 0  tests_strengthened: 0  tests_weakened: 0
