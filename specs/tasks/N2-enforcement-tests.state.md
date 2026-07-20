---
task: N2-enforcement-tests
branch: task/N2-enforcement-tests
status: done
loop_step: 6-done
last_verified: |
  2026-07-21 — 26/26 PASSED (22 smoke + 4 enforcement)

  ============================= test session starts =============================
  platform win32 -- Python 3.13.5, pytest-9.0.2, pluggy-1.6.0

  tests/test_enforcement.py::TestEnforcement::test_unauth_mutation_returns_401_contract_shape PASSED [  3%]
  tests/test_enforcement.py::TestEnforcement::test_wrong_role_403_rbac_denied_and_audit_row PASSED [  7%]
  tests/test_enforcement.py::TestEnforcement::test_guardrail_flag_annotates_but_returns_2xx PASSED [ 11%]
  tests/test_enforcement.py::TestEnforcement::test_guardrail_reject_returns_contract_shape PASSED [ 15%]
  tests/test_smoke_backend.py::TestHealth::test_root_endpoint PASSED           [ 19%]
  tests/test_smoke_backend.py::TestHealth::test_health_endpoint PASSED         [ 23%]
  tests/test_smoke_backend.py::TestHealth::test_stats_endpoint PASSED          [ 26%]
  tests/test_smoke_backend.py::TestActivities::test_list_activities PASSED     [ 30%]
  tests/test_smoke_backend.py::TestActivities::test_create_activity PASSED     [ 34%]
  tests/test_smoke_backend.py::TestActivities::test_activity_detail PASSED     [ 38%]
  tests/test_smoke_backend.py::TestJournals::test_list_journals PASSED         [ 42%]
  tests/test_smoke_backend.py::TestJournals::test_create_journal PASSED        [ 46%]
  tests/test_smoke_backend.py::TestJournals::test_journal_crud_flow PASSED     [ 50%]
  tests/test_smoke_backend.py::TestConnectionsAndAI::test_list_connections PASSED [ 53%]
  tests/test_smoke_backend.py::TestConnectionsAndAI::test_ai_suggestions PASSED [ 57%]
  tests/test_smoke_backend.py::TestExport::test_export_json PASSED             [ 61%]
  tests/test_smoke_backend.py::TestExport::test_export_markdown PASSED         [ 65%]
  tests/test_smoke_backend.py::TestExport::test_export_csv PASSED              [ 69%]
  tests/test_smoke_backend.py::TestSearch::test_search_endpoint PASSED         [ 73%]
  tests/test_smoke_backend.py::TestAgentMemory::test_agent_stats PASSED        [ 76%]
  tests/test_smoke_backend.py::TestAgentMemory::test_agent_persona PASSED      [ 80%]
  tests/test_smoke_backend.py::TestAgentMemory::test_list_memories PASSED      [ 84%]
  tests/test_smoke_backend.py::TestNotifications::test_list_notifications PASSED [ 88%]
  tests/test_smoke_backend.py::TestAIConfig::test_get_ai_config PASSED         [ 92%]
  tests/test_smoke_backend.py::TestSecurity::test_cors_headers_present PASSED  [ 96%]
  tests/test_smoke_backend.py::TestSecurity::test_security_headers PASSED      [100%]
  ======================== 26 passed, 2 warnings in 52.24s ======================

agent_log:
  - "2026-07-21: First gate run against old server (PID 30604, pre-edit code) — 2 failures:
     test_wrong_role got 401 (JWT secret still empty string); test_guardrail_reject got 200
     (old code didn't forward provenance). New uvicorn (PID 7156) failed to bind — 30604
     was already holding port 8001."
  - "2026-07-21: Root causes fixed: (1) load_dotenv moved to top of server.py — confirmed
     auth.py now captures real JWT_SECRET_KEY (len=43) at import time. (2) guardrails_content_check
     now converts claimed_provenance/actual_provenance strings to Provenance enum members before
     passing to run_guardrails — check_provenance_downgrade called .value on raw strings causing
     AttributeError → 500. Killed old server (PID 30604 → 23532 by port lookup), restarted."
  - "2026-07-21: 26/26 PASSED with corrected server. Gate complete."

next_action: merged to trunk

decisions:
  - "load_dotenv MUST precede all local imports in server.py: auth.py captures JWT_SECRET_KEY at
    module level; late load = empty string secret for all token operations."
  - "Provenance string values from HTTP request body must be cast to Provenance(value) enum before
    passing to run_guardrails — check_provenance_downgrade calls .value on its arguments."
  - "REJECTED: modifying check_provenance_downgrade to accept raw strings — the enum type hint is
    correct and protects internal logic; conversion belongs at the HTTP boundary (server.py)."

metrics:
  tool_calls_used: 35 (budget 40)
  gate_runs: 3  gate_failures: 2 (run 1: against stale PID 30604; run 2: Provenance .value crash → 500 on test 4)
  tests_added: 4  tests_strengthened: 0  tests_weakened: 0
---
