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

**Remediation:** Owner to place `personal-cognitive-os-architecture_tar.gz` at confirmed path;
extract to `D:\cognitive-os\reference\scaffold\`; read actual source files before rewriting specs.

**Rule going forward:** Reuse maps MUST point at verified, on-disk file paths. "Derive from spec"
is only valid after the owner explicitly confirms the source file does not exist. Any reuse map
entry that cannot be verified by `ls <path>` before spec commit is a defect. This applies to
ALL future task specs — check the file exists before naming it as a reference.

*Note: this is recorded as deviation #8; deviation #7 is the docs canonicalization decision above.*
