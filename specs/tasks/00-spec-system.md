# 00 — The Spec System v1.1 (agent-portable, pausable, parallel)

*v1.1 supersedes v1.0 (kept as `00-spec-system-v1.0-superseded.md`, per the append-only rule).
Changes: task ledger corrected from the full branch validation (see
`branch-validation-report.md`); added agent portability (Claude Code / Hermes / PI / any),
pause-resume state, parallel execution rules, and the Shepherd update.*

---

## Two spec layers (unchanged from v1.0)

- **`specs/modules/`** — living source of truth, one file per concern. Edited only when a
  numbered task drives it; the commit references the task number.
- **`specs/tasks/`** — append-only chronological ledger: `NN-<name>.md` (the ask, written before
  code), `NN-<name>-decisions.md` (mandatory on completion; includes rejected alternatives),
  `NN-<name>-learnings.md` (when something non-obvious surfaced).

## The task spec template (unchanged from v1.0 — GOAL / MODULE SPECS / REUSE MAP /
## TDD CONTRACT / GUARDRAIL-PROVENANCE / OUT OF SCOPE / DONE MEANS)
See v1.0 file for the full template; it is unchanged except one added field:

```markdown
## FILE SCOPE (for parallelism — see §Parallel execution)
Exact directories/files this task may touch. Anything outside scope is a violation, not initiative.
```

---

## NEW §A — Agent portability (Claude Code, Hermes, PI, or any coding agent)

The spec system must work identically whichever agent picks up a task. Three plain files make
that true — no agent-specific machinery anywhere else:

1. **`AGENTS.md`** (repo root) — the vendor-neutral entry point every agent reads first. Content:
   "Read `specs/tasks/00-spec-system.md`. Find your task's state file. Follow the execution loop.
   Never work outside your task's FILE SCOPE."
2. **`CLAUDE.md`** (repo root) — one line: "See AGENTS.md." (Claude Code auto-reads CLAUDE.md;
   other agents read AGENTS.md; both converge on the same instructions. Never duplicate content
   between them — pointer only, so they can't drift.)
3. **`specs/tasks/NN-<name>.state.md`** — the pause/resume handoff file (next section).

Rule: **all state lives in the repo as committed markdown.** No agent-local memory, no session
scrollback, no IDE state is ever load-bearing. If an agent's context vanished mid-task, the next
agent (or the same one tomorrow) must be able to resume from the repo alone. This is the same
principle as the master prompt's "attach files, don't retype context," applied to execution.

## NEW §B — Pause / resume / switch protocol

Each in-progress task has `NN-<name>.state.md`, updated **at every loop-step boundary** and
committed with the work:

```markdown
# State: NN-<task-name>
status: not_started | in_progress | blocked | review | done
loop_step: read | red | green | gate | record | update      # the 6-step loop from v1.0
branch: task/NN-<name>
last_verified: <paste of last full test-run output, with timestamp>   # provenance: verified_artifact
next_action: <one concrete sentence — what the next session does first>
blocked_on: <only if status=blocked — the exact question or missing input>
agent_log: <one line per session: date, which agent (claude-code/hermes/pi/human), what moved>
```

- **Pausing** = commit code + state file, push the task branch. Nothing else.
- **Switching agents** = the new agent reads AGENTS.md → the task spec → the state file →
  `last_verified`, re-runs the full suite to confirm reality matches the recorded state
  (**trust the state file's claims only after reproducing them** — same rule as everywhere else),
  then continues from `next_action`.
- A state file whose `last_verified` can't be reproduced is a named discrepancy: flag it in the
  state file, don't silently proceed.

## NEW §C — Parallel execution

Tasks run in parallel when and only when their **FILE SCOPEs are disjoint**:

- One branch + one git worktree per task: `git worktree add ../wt-NN task/NN-<name>` — parallel
  agents never share a working directory.
- Scope conflicts are resolved in the ledger, not at merge time: if two ready tasks overlap, the
  lower number runs first, or the specs are re-cut to disjoint scopes.
- **Merge gate (serialized)**: merges to `main` happen one at a time; each must run the FULL
  suite (backend unit + agent-service pytest + Expo Jest + Playwright where runnable) on the
  merge result. A task green in its worktree but red after rebase is not done.
- Safe first parallel set from the current ledger: 02+03 (both port INTO new FastAPI modules but
  different files) ∥ 09-prep (client screens) ∥ 10 (backup scripts) — after 01 lands.

## NEW §D — Shepherd (updated status — supersedes docs/VERSIONING.md §1's "no stable package")

Shepherd (Stanford/Northeastern) is now public: `github.com/shepherd-agents/shepherd`, paper
arXiv 2605.10913, released early July 2026. What it actually is: a runtime substrate that turns
an agent run into a reversible git-like trace — every tool call/file write/db op is a commit,
forks are branches, copy-on-write ~5x faster than `docker commit`, ~95% KV-cache reuse on
replay; agent writes land in a shadow workspace (`.shepherd/traces/<run>/output/`) and touch the
real tree only on explicit commit, with OS-level sandbox policies derived from typed bindings.
*(Provenance: verified against the public repo/paper existing today; performance numbers are the
authors' claims, not reproduced here.)*

Adoption decision — **two distinct uses, staged**:
1. **For the build process (coding agents), adopt as an optional harness now.** Its
   shadow-workspace + fork/revert model composes cleanly with §C's worktree-per-task: an agent
   session inside Shepherd can be reverted mid-run without dirtying the task branch. Optional
   because it's ~2 weeks old: any task must remain completable with plain git + the state file.
   Shepherd is an accelerator, never a dependency.
2. **For the system's own runtime (versioning what agents produce), integration point is
   unchanged**: `agent_layer/orchestrator.py::run_agent_step` — checkpoint/fork wraps there and
   nowhere else. Note the deep alignment: Shepherd's stage-then-commit shadow workspace is the
   same shape as our staging→confirmation flow; when adopted, staging semantics map onto trace
   commits rather than being reinvented.
3. `docs/VERSIONING.md` gets updated by the first task that touches it, citing this section.

---

## Task ledger v1.1 (corrections from branch validation in **bold**)

| # | Task | Status / correction |
|---|---|---|
| 01 | **Fast-forward `feat/ui-revamp-v4` → `main`, delete v3, fix the 7 stale theme-identity Jest tests** | Was "merge v3+v4"; validation proved v3 ⊂ v4 and main has 0 unique commits — conflict-free. The 7 test fixes are the first red→green rep |
| 01 | **REVISED by `00-environment-decisions.md` (2026-07-19)**: fast-forward merge to main is REMOVED from scope. Task 01 is now: fix the 7 stale theme-identity Jest tests only. Branch: `task/01-theme-tests` off `feat/ui-revamp-v4`. Governing spec: `specs/modules/theming.spec.md` rule 3. Original row preserved above per append-only rule. | |
| 02 | Port RBAC permission matrix (rbac.js pattern) into FastAPI backend as a new module **with its own unit tests (backend currently has none — only 22 live-server integration tests)** | Scope sharpened |
| 03 | Port guardrails.py four checks into FastAPI backend | Parallel-safe with 02 (disjoint files) |
| 04 | **Extract inline audit logging out of monolithic `server.py` into a module**, then extend to audit-log.spec.md schema | Rescoped: it's inline today, not a standalone logger |
| 05 | Error contract + structured error propagation (backend → both clients) | Unchanged |
| 06 | Mongo → Kùzu/LanceDB migration against real collections | Unchanged |
| 07 | Wire GraphStore to live Kùzu (turns `test_write_requires_kuzu_connection` green) | Unchanged |
| 08 | agent-service: orchestrator + journal-capture sub-agent end-to-end. **Reuse CiggTrack's `cigarette_log`/`smoking_data_service` model semantics for the Habit node; port YOUR super-agent patterns from langgraphjs `kiro-js-conversion` (intent-router w/ typed confidence+reasoning; ReWOO/RAG/SQL subgraph shapes) TS→Python; each sub-agent task spec includes a `prompts.md`-style scenario catalog, automated in its TDD contract; tracing-backend decision (Opik vs Phoenix) lands here** | Reuse map + scenario-catalog + tracing decision |
| 09 | Extend web (Next.js/TS, 17–18 routes) + mobile (Expo) with journal-capture + staging-confirmation screens. **Stack wording corrected: Next.js+TS, not plain JSX** | Corrected |
| 10 | Backup/restore ("Vault"). **Reuse maaxly `gcp-deploy-nov15:scripts/backup/backup.sh` + its GCP docs as the base** | Reuse map addition |
| — | Standing rule: **any maaxly reuse sources from `gcp-deploy-nov15`, never `main` (26 commits stale); never inherit maaxly's Jest config (broken — all suites SyntaxError)** | New, from validation |
| — | **TRUNK DECISION (2026-07-19)**: `feat/ui-revamp-v4` is the EFFECTIVE TRUNK. All `task/*` branches base off it; all merges gate into it. `main` is explicitly frozen (stale, untouched) until the owner personally decides to fast-forward it. Never base work on `main`. Recorded in `specs/tasks/00-environment-decisions.md`. | New, from environment decisions |
| 17 | **mail-agent (Gmail)**: read/triage/label = free ops; delete/archive/send = staged, owner-confirmed (or narrow auto-commit rules); learned context (sender patterns, commitments) staged per privacy spec rule 4. Reference: agents-from-scratch (HITL email assistant — closest prior art to our staging model); inbox-zero = what "not enough" looks like: triage without provenance; gwspacecli = API plumbing | NEW — was a genuine gap |
| 18 | **memory manager** (Letta-pattern, provenance-gated) per modules/memory.spec.md — core OKF bundle, staged self-editing, consolidation agent | NEW — was a genuine gap |
| 19 | **polymath-mcp server** per modules/interop.spec.md — expose graph as RBAC-scoped MCP tools; + OKF exporter | NEW |
| — | Standing rule: **the 8 fork repos are reference-only (see fork-audit-report.md role table); nothing from them is integrated unless a numbered task spec says so. Your own work in langgraphjs lives on `kiro-js-conversion` (⊇ `hr-agent`)** | New, from fork audit |
| 09a | **design-language**: aesthetic token layer on top of M3 — soft-minimal, typography-led (Claude/Mistral-app feel); applies to both mobile (Expo) and web (Next.js). Target: named token set committed to `specs/modules/theming.spec.md`; theme-identity Jest tests updated in same commit. Runs BEFORE Task 09. Decisions file must record: Archivist-vs-soft-minimal choice with rejected alternative. | NEW — added 2026-07-19 |
| 20 | **docs-site** (low priority): MkDocs Material served over `specs/` + `docs/`; deployed to GitHub Pages. Markdown in git is the only source of truth — docs-site is a read view, never an edit surface. | NEW — added 2026-07-19 |
| — | Convention: `context/session-logs/` holds browser + Claude Code `/export` transcripts. prompt-gallery agent (T-wishlist#1) will ingest it later. Never commit transcripts containing secrets. | NEW — added 2026-07-19 |
| — | **Correction to branch-validation-report** (append, not edit): The report claims "7 theme-identity failures." Phase C baseline (2026-07-19) established the correct breakdown: 4 theme-identity tests (theme.test.ts) + 3 CollapsibleHeader constant tests (navigation-components.test.tsx) = 7 total. Additionally, 2 suites fail to run entirely (store.test.ts, ui-components.test.tsx) — these are suite-load errors, not counted in the 7. | Correction, from Phase C |
| — | **Correction-to-correction (Task 01, 2026-07-19)**: Phase C '250 total tests' was itself an environmental artifact — missing AsyncStorage mock hid 53 tests in two suites that failed to run. Task 01 fixed the mock; all 303 tests now run. The branch-validation-report's original '303 Jest tests' claim is hereby CONFIRMED. **Lesson: environmental failure can masquerade as claim-inflation; verify tooling before correcting numbers.** Canonical baseline confirmed: 303 frontend Jest, 22 backend integration. | Correction-to-correction, from Task 01 |
| 21 | **screenshot-vault** — cross-device screenshot memory (Phase 4 lane). Pain: capture everywhere (PC/personal/office/mobile), retrieval fails 70% → repeat R&D. Design: (a) CAPTURE: one synced inbox folder per device — Syncthing (local-first) or existing OneDrive; mobile screenshots dir auto-included; (b) INGEST: watcher → OCR (docling primary, surya/RapidOCR fallback) → vision-caption → perceptual-hash dedup (dhash; near-dupes FLAG via guardrails) → staged `Screenshot` nodes {device, captured_at, app_hint, ocr_text, caption, embedding→LanceDB}; (c) RETRIEVE: semantic+temporal+device filters; proactive surfacing to journal/memory agents. Schemas registry += `Screenshot`. | NEW — added 2026-07-19 |
| 22 | **triggers** — webhooks/schedules/loops. APScheduler inside agent-service for cron (backup, consolidation, curriculum drip); FastAPI `/webhooks/*` gated as role `agent:service` + per-source secret; loops = LangGraph cycles with hard budget caps (max-iterations + token ceiling per run, exceeding → FLAG). No Kafka, no n8n dependency (n8n stays optional external via MCP). Extensibility rule: new trigger = register, don't modify core. | NEW — added 2026-07-19 |
| 23 | **gh-aw pilot** (GitHub Actions technical preview 2026-02-13; markdown workflows in .github/workflows; read-only default + sanitized safe-outputs; AWF network firewall; engines incl. Claude). Adopt NARROWLY: nightly full-suite run + failure-investigator workflow (files structured issues) + spec-drift checker (state files updated with every task branch). NEVER for security-surface or migration tasks. Read-only + safe-outputs + owner-gated. Low priority, high leverage. | NEW — added 2026-07-19 |
| — | **Agentic-infra mapping decision** (2026-07-19): (1) Vendor-neutral: YES — AGENTS.md is harness-agnostic; made structural in T08 via ONE gateway module (LiteLLM-style provider abstraction, per-agent model config, Ollama slot for sensitive inference). No SDK imports outside the gateway. (2) Tool-call security: every call passes authenticate→rbac→guardrails→audit; external exposure only via polymath-mcp (T19) with scoped role. (3) Triggers: T22. (4) Guardrails maintainability: checks are a registered list — add-a-check = file+register+tests, zero core edits; T03's decisions file shows check_pii entering exactly this way as living proof. gh-aw's AWF/MCP-gateway independently validates the layered design. | NEW — added 2026-07-19 |
| — | **Q4 confirmation** (2026-07-19): endpoint validation = Pydantic re-validation (exists) + T05 contract; error schema = T05; toasts/notifications = notifications spec + ui-ux, land with T09a/T09. The brainstorm-to-feature mechanism IS the ledger: idea → append row → task spec from template → any agent builds it. autopilot-pack.md §3 is itself the mechanism working. | NEW — added 2026-07-19 |
