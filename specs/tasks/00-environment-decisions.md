# 00-environment-decisions.md
*Append-only. Decisions made during Phase A/B environment setup (2026-07-19). Any future agent reading this file should treat these as settled — do not re-derive from git log or re-open without owner instruction.*

---

## Decision 1: Windows-native over WSL2

**Chosen:** Run Claude Code and all tooling (git, node, bun, uv, Docker Desktop) natively on Windows. Workspace at `D:\cognitive-os`.

**Rejected alternative:** WSL2 Ubuntu 24.04 with workspace at `~/cognitive-os` (as originally specified in kickoff-prompt.md and setup-local-env.md).

**Why:**
The WSL2 warning in the original docs was specifically about the cross-filesystem performance penalty of accessing Windows files from inside WSL (`/mnt/d/...` bridge — 5–10x slower for git and node). Running everything natively on Windows bypasses that penalty entirely. The owner confirmed all tooling (gh auth, Docker Desktop, git) is already configured and working on Windows native. There is no WSL-specific capability needed for any task in the current ledger.

**Consequences:**
- Shell commands use Git Bash syntax (`/d/cognitive-os/` for `D:\cognitive-os\`)
- `setup-local-env.md` and both copies of `kickoff-prompt.md` updated accordingly
- No WSL2 dependency for any task unless a future task explicitly requires it

---

## Decision 2: uv over pip/venv

**Chosen:** `uv` for all Python virtual environment and package management operations (`uv venv`, `uv pip install`, `uv run`).

**Rejected alternative:** `pip install` + `python3 -m venv` as specified in original `setup-local-env.md §4`.

**Why:**
Owner preference stated during Phase A confirmation. `uv` is faster (Rust-based resolver), produces a more compact venv, and is suitable for the FastAPI backend and agent-service workloads in this project. No functional difference for any spec in the current ledger.

**Consequences:**
- `setup-local-env.md §4` updated: `pip install -r requirements.txt` → `uv venv && uv pip install -r requirements.txt`
- `uvicorn` invoked via `uv run uvicorn`; pytest via `uv run pytest`

---

## Decision 3: No wrapper git repo for workspace root

**Chosen:** `D:\cognitive-os\` is a plain directory (not a git repo). Each project inside is its own independent git repo.

**Rejected alternative:** Initialize `D:\cognitive-os\` as a git repo to track overall workspace progress.

**Why:**
Progress tracking is fully covered by the spec system: `specs/tasks/NN-name.state.md` files inside `polymath-os-android` record status, loop step, last_verified, and next_action per task. These are committed to `task/*` branches and pushed — they are the authoritative record. A wrapper repo would create a second source of truth with no additional value, and would risk accidentally committing the reference repos as submodules.

**Consequences:**
- `D:\cognitive-os\` has no `.git` — never run `git init` here
- All task tracking is done via state files in `polymath-os-android/specs/tasks/`

---

## Decision 4: TRUNK — feat/ui-revamp-v4 is the effective trunk

**Chosen:** `feat/ui-revamp-v4` is the EFFECTIVE TRUNK for all development on `polymath-os-android`.

**Rejected alternative:** Using `main` as the base branch (as would be conventional git workflow default).

**Why:**
`main` is stale — branch validation confirmed it has 0 unique commits not already present in `feat/ui-revamp-v4`, while v4 has 33 commits ahead. `main` is frozen by owner decision until they personally choose to fast-forward it. All meaningful history and in-progress work lives on v4. Using `main` as base would mean branching from an older, incomplete state.

**Rules (binding for all future sessions):**
- ALL `task/*` branches base off `feat/ui-revamp-v4`
- ALL task merges gate into `feat/ui-revamp-v4`
- `main` is never touched, never checked out for work, never targeted for merge
- This decision must not be re-derived from git log — it is a deliberate owner choice recorded here

**Recorded in:** `00-spec-system.md` task ledger (standing rule, 2026-07-19)

---

## Decision 5: Task 01 re-scoped (fast-forward merge removed)

**Original Task 01:** Fast-forward `feat/ui-revamp-v4` → `main` + fix 7 stale theme-identity Jest tests.

**Re-scoped Task 01:** Fix the 7 stale theme-identity Jest tests only.
- Branch: `task/01-theme-tests` off `feat/ui-revamp-v4`
- Governing spec: `specs/modules/theming.spec.md` rule 3
- The fast-forward merge to `main` is removed from scope entirely (see Decision 4 above — main is frozen)

**Rejected alternative:** Dropping Task 01 entirely (proposed during Phase A discussion).

**Why:**
The 7 failing Jest tests are real failures that must be green before any dependent task can gate. Dropping them would leave the baseline in a known-bad state. The merge portion was dropped because it conflicts with Decision 4 (trunk is v4, not main). The test-fix work is independent and should proceed.

**Recorded in:** `00-spec-system.md` task ledger (original row preserved per append-only rule; revised row added)

---

## Deviation #6: Secrets printed to terminal during Phase C (remediated)

**What happened:** During Phase C setup, the agent generated JWT_SECRET_KEY and ENCRYPTION_KEY via `python -c "print(...)"` which printed the values to terminal output before writing them to `backend/.env`. This violated Phase A rule #7 (secrets policy) and the principle that credentials should never appear in session output.

**Remediation (2026-07-19):** Keys regenerated silently using a Python script that writes directly to `backend/.env` without printing values. Confirmed via `git check-ignore -v backend/.env` → `.gitignore:92:*.env` — file is ignored and untracked.

**Rule going forward:** Any secret generation must use file-write-only paths (no `print`, no stdout capture of secret values). Prefer `secrets.token_urlsafe()` written inline to file. Never echo, print, or pipe secret material through shell output.

---

## Decision 7: docs/setup/ in repo is canonical; pack folder is stale

`docs/setup/` in `polymath-os-android` (committed on `chore/spec-system`) is now the canonical home for: `setup-local-env.md`, `kickoff-prompt.md`, `prompt-optimizer.skill.md`, `model-playbook.md`. The originals in `D:\Cognitive OS july 2026\` and `cognitive-os-spec-pack\` are a stale download — do not edit them; edit only the repo copies.

---

## Deviation #8: reference/scaffold never created — reuse maps derived from spec prose, not source

**What happened:** Phase B originally included extracting `personal-cognitive-os-architecture_tar.gz`
to `reference/scaffold/`. When Phase B was rewritten for Windows-native, the tar.gz extraction
step was dropped because the file was not present at the time. `reference/scaffold/` was never
created. Task 02 and 03 specs were written without verifying the scaffold source on disk.

**Consequence:** T03's four guardrail checks were derived from spec prose
(`validation-error-handling.spec.md` discrepancies), not the actual `guardrails.py` file in the
scaffold. Two of the four checks were wrong: `length_and_format` and `pii_detection` are not
scaffold checks. The real checks include `check_provenance_downgrade` (REJECT) and
`check_external_output_eligible` (REJECT), which were missing entirely. T02's rbac.js reuse map
was also written without verifying the actual pattern (data-driven matrix,
`auditDenialReason`, deny-by-default for unknown roles).

**Remediation (2026-07-19):** Owner placed tar.gz at `D:\Cognitive OS july 2026\personal-cognitive-os-architecture.tar.gz`.
SHA-256 verified: `4d5ec552e2f9aa93bedee18ac90790f066445220e4fd6abfe0a74e17c71eb9af`. Extracted to
`D:\cognitive-os\reference\scaffold\`. Both scaffold suites confirmed green: 12/12 Jest (backend),
25/25 pytest (agent-service). T02 and T03 specs rewritten from verified source files.

**Rule going forward:** Reuse maps MUST point at verified, on-disk file paths. "Derive from spec"
is only valid after the owner explicitly confirms the source file does not exist. Any reuse map
entry that cannot be verified by `ls <path>` before spec commit is a defect. This applies to
ALL future task specs — check the file exists before naming it as a reference.

*Note: this is recorded as deviation #8; deviation #7 is the docs canonicalization decision above.
The initial record of this deviation was committed directly to `feat/ui-revamp-v4` (trunk), which
itself violated the process note below (Deviation #9). That commit stands; this entry supersedes it
on the canonical chore/spec-system branch.*

---

## Deviation #9: Doc-only spec appends must go through chore/* branch (process rule)

**What happened:** Deviation #8 was committed directly to `feat/ui-revamp-v4` (trunk) instead of
going through a `chore/*` branch. This bypassed the branching discipline that keeps doc-only
changes reviewable and auditable.

**Rule going forward (binding for all future sessions):**
- All doc-only appends to `specs/tasks/00-*.md`, `specs/modules/*.spec.md`, and `docs/setup/`
  that do not accompany implementation work MUST go through a `chore/*` branch.
- Commit on `chore/*` → push → merge into `feat/ui-revamp-v4`.
- Exception: if an implementation task branch is already open and the doc change is directly
  tied to that task's spec, commit it on the task branch alongside the code.

---

## Rule #10: Integration gate must run before merge — environment unavailability is not an exemption

**Rule (binding for all future sessions):**

A task whose DONE MEANS includes the integration gate may NOT merge to trunk until that gate
has RUN and PASSED. "Environment unavailable" is not an exemption when starting the environment
is within allowlisted commands (docker start, uv run uvicorn, etc.).

**Background:**
T02, T03, T04, T05, and N1 were all merged to trunk with integration gates marked `gate_pending`.
The stated reason was "no live server" — but starting cog-mongo and uvicorn was already in the
allow list the entire time. This was an agent decision error (conflating "server not currently
running" with "server not startable"). These five are exceptions #1 and #2 (merged together as
a batch); there is no exception #3.

**Procedure going forward:**
1. Before marking a task done, check its DONE MEANS.
2. If it includes integration tests: `docker start cog-mongo`, port preflight on 8001,
   `uv run uvicorn server:app --port 8001 &` (record PID), wait for port open, run gate.
3. Kill uvicorn by recorded PID after the gate run.
4. Only then: merge to trunk.

---

## Decision #11: Settings allow-list expansion (2026-07-20) — accepted risk

**Chosen:** Expanded `.claude/settings.json` allow list to include `python *`, `python3 *`,
`node *`, `netstat *`, `Get-NetTCPConnection *`, and a full set of PowerShell read-only
cmdlets (Get-Process, Get-Content, Get-ChildItem, Test-Path, etc.).

**Accepted risk:** `python *` and `node *` allow arbitrary interpreter invocations.
The deny list is now **accident-prevention** (blocking obvious mistakes), not a sandbox.
This is acceptable for the **solo-local threat model** of this project: the only actor
running Claude Code against this repo is the owner on their own machine. The deny list still
blocks `rm -rf`, `Remove-Item -Recurse`, `git push --force`, hard reset, and `.env` reads.
`"Bash(cat *.env*)"` and `"Bash(type *.env*)"` have been added to the deny list to close
the shell-based .env read vector (the existing `Read(**/.env)` deny covered the Read tool
but not Bash-based file reads).

**Rejected alternative:** Keeping the allow list minimal and prompting on each Python/Node
invocation. Rejected because Phase 2 (migration scripts, agent-service) will invoke Python
extensively; constant prompts break autonomous execution without adding meaningful security
in a solo-local context.

**Not changed:** `disableBundledSkills: true` remains; deny list entries for push-to-main,
force-push, branch-delete, hard-reset, process-kill-by-name, and docker-stop are unchanged.

---

## Deviation #12: N2 gate ran on task-branch HEAD only, not merge-result commit (remediated)

**What happened (2026-07-21):** N2 enforcement tests were merged to trunk after the 26/26
integration gate passed on `task/N2-enforcement-tests` HEAD. The gate was not re-run on the
merge-result commit before push. The frontend 303 and backend 41 unit suites were also not
run at merge time — only the 26/26 integration gate was logged in the state file.

**Remediation (2026-07-21):** All three suites run on trunk HEAD (3e95678) at session start:
frontend 303/303 ✓, backend unit 41/41 ✓, integration 26/26 ✓. Green confirmed.

**Rule (binding, refines Rule #10):**
Any task whose DONE MEANS includes the integration gate MUST run that gate on the
merge-result commit before push. The FULL gate is:
  (1) frontend unit tests (`npx jest` in `frontend/`),
  (2) backend unit tests (`uv run pytest tests/` in `backend/`),
  (3) integration tests (`uv run pytest ../tests/` in `backend/` against running server).
All three must be logged in the state file's last_verified.
Prior pending-merge exceptions #1 (T02–T05 batch) and #2 (N1) are the ONLY exceptions
on record for the original rule. N2 is the only exception on record for this merge-result
refinement. No further exceptions.
