# Autopilot Pack — self-sufficient session execution + new-capability ledger
*Place at `docs/setup/autopilot-pack.md` via a `chore/autopilot-pack` branch, merge to trunk,
then follow §1. This file lets Claude Code (Sonnet) run the queue end-to-end WITHOUT pasting
progress to the browser session. Written 2026-07-19, after T02 was interrupted mid-GREEN by
rate limit.*

---

## §1 THE AUTONOMY CONTRACT (paste this as the session opener after reset)

> Read docs/setup/autopilot-pack.md §1–§4 and AGENTS.md. You are authorized to execute the
> QUEUE in §2 autonomously, task by task, WITHOUT stopping for my approval, under this contract:
>
> ALLOWED without asking: everything inside a numbered task spec's FILE SCOPE following the
> six-step loop; branch creation; commits; pushes of task/chore branches; serialized merges to
> feat/ui-revamp-v4 that pass the FULL gate; state-file and decisions-file writes; re-running
> suites; starting/stopping local dev servers and the cog-mongo container.
>
> MUST STOP and write the question into the task's state file `blocked_on`, then move to the
> next NON-CONFLICTING queue item (never idle-wait):
> (a) any gate failing twice for the same cause, (b) anything touching main or deleting
> branches, (c) a spec contradiction or scope conflict, (d) secrets beyond local .env
> generation (write-only, never printed), (e) budget exceeded (per-task ≤40 tool calls),
> (f) any test that must be weakened to pass — weakening is ALWAYS a stop.
>
> Per-session hygiene: one task per session; /export to context/session-logs/ then /clear
> between tasks (compaction already bit us once); update the state file at every loop-step
> boundary so ANY future session resumes from repo alone.
>
> SELF-REVIEW before marking any task done (this replaces the browser-Claude review):
> 1. Diff review: every changed assertion is STRONGER or equal, never weaker; test names match
>    what they assert. 2. No bypass/env-conditional security paths. 3. Decisions file has:
> choices, REJECTED alternatives, deviations. 4. Full gate output pasted in state file
> (frontend 303 + backend unit + 22 integration). 5. Branch pushed. 6. Metrics block (§4)
> filled. Only then: done.

## §2 THE QUEUE (execute in order; parallelize only where marked)

1. **T02 finish (wt-02)** — resume at GREEN. FIRST: replace the brittle word-grep in
   `test_no_permissive_bypass_flag_exists` — grepping docstrings for "bypass" caused
   whack-a-mole against our own documentation. Correct test: parse `rbac.py` with `ast`,
   assert NO `os.environ`/`os.getenv` reads and NO conditional branching on any env value
   inside permission-decision paths (module docstrings free to say anything). Then finish
   loop: gate, decisions (incl. agent:service justification + this test-design decision),
   state, push.
2. **T03 implement (wt-03)** — per rewritten spec: 5 scaffold checks ported verbatim-in-spirit
   (incl. Maaxly regression test), check_pii spec-added w/ cited regex source, 17 tests, same
   AST-based bypass test design as T02.
3. **Serialized merge protocol** — merge 02 → trunk, FULL gate on merge result, then rebase 03
   on trunk, FULL gate, merge, gate again. Never both-then-test-once. Remove both worktrees
   after.
4. **T04 (audit extraction)** — write task spec FIRST from template (reuse map: verified paths
   into server.py's log_audit_event + scaffold auditLog.js + audit-log.spec.md), then
   implement: extract to backend/audit.py, extend schema (actor, action, resource, result,
   denial_reason ← request.state.audit_denial_reason from T02, request_id), middleware order
   per system-design rule 2. All existing calls migrated, zero behavior loss, unit tests.
5. **T05 (error contract)** — spec first, then: error payload module per
   validation-error-handling.spec.md, wire FastAPI exception handlers, rbac_denied +
   guardrail_flag/reject emit contract shape, request_id everywhere. Client-side toast/inline
   rendering is NOT this task (lands with T09a/T09) — backend contract only.
6. **STOP LINE**: after T05 merges green, write specs/tasks/phase-1-report.md summarizing all
   state files + metrics, push, and END. Owner reviews before Phase 2 (migration) — data
   migration is never autopiloted.

## §3 NEW CAPABILITIES → LEDGER APPENDS (do as one chore commit with the pack)

Append to 00-spec-system.md ledger + roadmap Phase 4/5:

| # | Task | Notes |
|---|---|---|
| 21 | **screenshot-vault** — the cross-device screenshot memory | Pain: capture everywhere (PC/personal/office/mobile), retrieval fails 70% → repeat R&D. Design: (a) CAPTURE: one synced inbox folder per device — Syncthing (local-first, fits stack) or existing OneDrive — mobile screenshots dir auto-included; (b) INGEST: watcher → OCR (reuse forks: docling primary, surya/RapidOCR fallback) → vision-caption → perceptual-hash dedup (dhash; guardrail: near-dupes FLAG) → staged `Screenshot` nodes {device, captured_at, app_hint, ocr_text, caption, embedding→LanceDB}; (c) RETRIEVE: semantic+temporal+device filters, and proactive surfacing — journal/memory agents attach relevant screenshots to the problem being discussed (this kills the 70%). Schemas registry += `Screenshot`. Phase 4 lane candidate — it's a killer daily-use feature. |
| 22 | **triggers** — webhooks/schedules/loops | Genuine gap named by the infra checklist. Design: APScheduler inside agent-service for cron (backup, consolidation, curriculum drip); FastAPI `/webhooks/*` endpoints gated as role `agent:service` + per-source secret; loops = LangGraph cycles with hard budget caps (max-iterations + token ceiling per run, exceeding → FLAG). No Kafka, no n8n dependency (n8n stays optional external via MCP). Extensibility rule applies: new trigger = register, don't modify core. |
| 23 | **gh-aw pilot** (verified real: GitHub technical preview 2026-02-13; markdown workflows in .github/workflows; read-only default + sanitized safe-outputs; AWF network firewall; engines incl. Claude) | Adopt NARROWLY for repo-ops only: nightly full-suite run + a failure-investigator workflow that files structured issues; a spec-drift checker (state files updated with every task branch). NEVER for security-surface or migration tasks. Read-only + safe-outputs + owner-gated. Low priority, high leverage. |
| — | **agentic-infra mapping** (record as decisions entry, answers the four properties): (1) Vendor-neutral: YES by construction — AGENTS.md is harness-agnostic, model-playbook covers Kimi/OpenAI/Mistral/NVIDIA; make it structural in T08: agent-service calls models through ONE gateway module (LiteLLM-style provider abstraction, per-agent model config, Ollama slot for sensitive inference per privacy spec) — no SDK imports outside the gateway. (2) Tool-call security: every tool call passes authenticate→rbac→guardrails→audit; external exposure only via polymath-mcp (T19) with scoped role; Shepherd sandbox optional later — same layering gh-aw ships (AWF/MCP-gateway), independently validating the design. (3) Triggers: T22. (4) Guardrails maintainability: checks are a registered list — add-a-check = file+register+tests, zero core edits (extensibility.spec.md); T03's decisions file must show check_pii entering exactly this way as the living proof. |
| — | **Q4 confirmation**: endpoint validation = Pydantic re-validation (exists) + T05 contract; error schema = T05; toasts/notifications = notifications spec + ui-ux, land with T09a/T09. The brainstorm-to-feature mechanism IS the ledger: idea → append row → task spec from template → any agent builds it. This file's §3 is itself the mechanism working. |

## §4 METRICS PER TASK (Hud-inspired; 4 lines in every state file, cheap now, gold later)
```
metrics:
  tool_calls_used: N (budget 40)
  gate_runs: N  gate_failures: N (cause per failure, one line)
  tests_added: N  tests_strengthened: N  tests_weakened: 0   # last one MUST be 0
```
Weekly, these roll up into the observability spec's "what did every agent do" query — merge
rate and gate-pass rate become the system's own performance dashboard.

## §5 VIDEO OBSERVATIONS (mapped, with honesty: theses mapped from title/topic, not watched)
**Matt Pocock — skills-based AI coding workflow**: his core move — durable, versioned skill
files that travel across tasks instead of re-prompting — is structurally what we built:
AGENTS.md + prompt-optimizer.skill.md + task specs ARE the skills layer; our addition he'd
approve of: skills under test (the spec's TDD contract) and under provenance. Gap he'd likely
poke: our skills don't yet self-improve from outcomes — that's the prompt-gallery agent
(wishlist #1) ingesting session-logs + decisions files. Already queued; his talk is the
argument for raising its priority.
**May Walter, Hud — "From Blind Spots to Merged PRs"**: thesis (continuous measurement of
agent performance in production; blind spots = where tests don't look; merged-PR rate as the
honest metric) maps directly: our blind-spot ledger already exists (deviations #1–#9 — the
AsyncStorage 53-hidden-tests incident IS a blind-spot case study: green-looking suite, false
signal); §4 metrics make the measurement continuous; the T23 failure-investigator closes the
loop. Her frame confirms a principle we learned empirically today: **test output is a claim
about the environment, not the code — instrument both.**
