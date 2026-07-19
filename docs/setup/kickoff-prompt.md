# Kickoff Prompt — paste this as your FIRST message to Claude Code (or any harness)

*Run Claude Code from the Windows-native terminal (Git Bash or PowerShell). The workspace lives
at `D:\cognitive-os`. Do NOT use WSL2 — all tooling (git, node, bun, uv, Docker Desktop) is
configured natively on Windows and performs well there.*

---

You are setting up the Personal Cognitive OS workspace. Work strictly by the rules below.

## PHASE A — PERMISSIONS & CREDENTIALS (do this FIRST, all at once, then stop and wait)
Before touching anything, present me ONE consolidated checklist of everything you will need for
the ENTIRE setup, and wait for my confirmation/inputs. Do not ask for permissions piecemeal
later — surface them all now. The list must cover at least:

1. **Shell access scope**: you may run commands only inside `D:\cognitive-os` and `D:\Cognitive OS july 2026` (read-only for the second). Confirm you will ask before touching anything outside these.
2. **GitHub auth**: check `gh auth status` and `git config user.name/user.email`. If missing, ask me to run `gh auth login` interactively (I type the token/browser flow — you NEVER see or store the token) with scopes: repo, workflow. This is needed to: push `task/*` branches and avoid API rate limits.
3. **Git identity**: confirm the name/email to commit as.
4. **Docker Desktop**: confirm it's running (needed for Mongo now).
5. **Installs you intend to run** (list exact commands for my yes/no): node 20 via nvm, bun, python3.12 + uv, gh CLI.
6. **Anything destructive**: you will NEVER force-push, delete branches, or rewrite history without a per-action explicit yes from me. `main` is frozen — never touch it. All `task/*` branches base off `feat/ui-revamp-v4` (the effective trunk); all merges gate into it. No action on `main` without owner's explicit go.
7a. **Trunk**: `feat/ui-revamp-v4` is the EFFECTIVE TRUNK. Read `specs/tasks/00-environment-decisions.md` for rationale. This is non-negotiable and must not be re-derived from git log.
7. **Secrets policy**: you never write credentials into any file; `.env` files are created empty from `.env.example` and I fill them myself.

Print the checklist, then STOP until I answer.

## PHASE B — WORKSPACE ASSEMBLY (after my confirmation)
1. Create `D:\cognitive-os\{reference,context,worktrees}` (use Git Bash: `mkdir -p /d/cognitive-os/{reference,context,worktrees}`).
2. The spec pack is already at `D:\Cognitive OS july 2026\cognitive-os-spec-pack\` — use it directly as the canonical source. No unzip step needed.
3. Clone `TentacioPro/polymath-os-android` into `D:\cognitive-os\`; clone `TentacioPro/CiggTrack` and `TentacioPro/maaxly` into `reference/` (maaxly checked out at `gcp-deploy-nov15`); clone `TentacioPro/langgraphjs` blob-less into `reference/` at `kiro-js-conversion`.
4. Install the spec system into polymath-os-android exactly per `setup-local-env.md` §3 (AGENTS.md, CLAUDE.md, specs/modules/, specs/tasks/, roadmap) on a branch `chore/spec-system`. Copy the scaffold specs from the pack's references as instructed there. Commit with message `spec system v1.1 (task 00)`.
5. Put the four context docs into `context/`.

## PHASE C — BASELINE VERIFICATION (the trust step — do not skip, do not summarize away)
Run `setup-local-env.md` §4 exactly. Expected: frontend Jest 243 pass / 7 fail (the 7 stale
theme tests); backend 22 integration tests pass ONLY with server+Mongo up; Playwright 67 tests
present. Paste the REAL outputs (tail of each run) into
`specs/tasks/00-environment.state.md` as `last_verified`, with any deviation from expectations
called out BY NAME — a mismatch is a finding to report to me, never something to silently
accept or "fix" unprompted.

## PHASE D — STOP LINE
When C is done, print: the state file, the deviation list (or "none"), and the one-line
proposal for Task 02 (first parallel-safe task after spec system install). Then stop. Do NOT
begin any task without my explicit go.

## STANDING RULES (entire session)
- `AGENTS.md` + `specs/tasks/00-spec-system.md` govern everything; read them before Phase B.
- Never claim something works without pasted command output.
- If any step is ambiguous, state your chosen interpretation in one line and proceed — except
  for anything in the Phase A destructive list, which always waits for me.
