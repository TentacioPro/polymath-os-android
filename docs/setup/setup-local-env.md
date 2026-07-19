# Local Environment Setup — Personal Cognitive OS

*One-time setup, ~30–45 min. Runs natively on Windows — Git Bash for shell commands, all tools
(bun, FastAPI, Docker Desktop) configured natively. No WSL2 required.*

## 0. Prerequisites

| Tool | Version | Why |
|---|---|---|
| Git + Git Bash | 2.40+ | worktrees for parallel tasks; bash syntax for setup commands |
| Node.js | 20 LTS | Expo/Jest tooling |
| bun | 1.1+ | web/ uses bun.lock |
| Python | 3.12 + uv | FastAPI backend + agent-service (uv for venv/install) |
| Docker Desktop | latest | Mongo now; Kùzu/LanceDB later |
| VS Code | — | where Claude Code / agents attach |
| Flutter SDK | **skip** | CiggTrack is reference-only; never built here |

GPU note (RTX 3050 4GB): enough for small local models via Ollama later (7B quantized, tight).
Not needed for any task in the current ledger. Don't install CUDA toolchains yet.

## 1. Workspace layout — create exactly this

```
D:\cognitive-os\                     ← workspace ROOT (plain folder, NOT a git repo)
├── polymath-os-android\             ← THE active repo. Specs, AGENTS.md, all new code live HERE
├── reference\                       ← read-only. Mine for code/schemas; never run, never edit
│   ├── CiggTrack\                   (master — Habit/cigarette_log model semantics)
│   ├── maaxly\                      (checked out at gcp-deploy-nov15, the canonical branch)
│   ├── scaffold\                    (the personal-cognitive-os package — being merged INTO the repo)
│   └── langgraphjs\                 (checked out at kiro-js-conversion — YOUR super-agent + Kiro specs)
├── context\                         ← the attach-every-session docs
│   ├── personal_cognitive_os_plan_v6.md
│   ├── conversation_self_log.md
│   ├── branch-validation-report.md
│   └── qwen-research-triage.md
└── worktrees\                       ← parallel task checkouts (created per task, deleted after merge)
```

Why this shape: one source of truth per concern. The root is organization; git history and specs
belong to the one repo that ships. Reference repos stay pristine so "what did my old code
actually do" always has a checkable answer.

## 2. Commands
*Run in Git Bash (Start → "Git Bash"). Forward slashes work fine; /d/ maps to D:\*

```bash
mkdir -p /d/cognitive-os/{reference,context,worktrees} && cd /d/cognitive-os

# The active repo
git clone https://github.com/TentacioPro/polymath-os-android.git

# Reference clones (read-only by convention)
git clone https://github.com/TentacioPro/CiggTrack.git reference/CiggTrack
git clone https://github.com/TentacioPro/maaxly.git reference/maaxly
cd reference/maaxly && git checkout gcp-deploy-nov15 && cd ../..   # canonical branch, per validation
tar -xzf /path/to/personal-cognitive-os-architecture_tar.gz -C reference/ \
  && mv reference/personal-cognitive-os reference/scaffold
git clone --filter=blob:none https://github.com/TentacioPro/langgraphjs.git reference/langgraphjs
cd reference/langgraphjs && git checkout kiro-js-conversion && cd ../..
# open-notebook / career-ops: clone into reference/ only when Tasks 11 / 13 start

# Drop the context docs into context/  (from D:\Cognitive OS july 2026\cognitive-os-spec-pack\)
```

## 3. Install the spec system into the repo

```bash
cd ~/cognitive-os/polymath-os-android
mkdir -p specs/modules specs/tasks
# From this session's outputs:
cp <outputs>/AGENTS.md <outputs>/CLAUDE.md .
cp <outputs>/00-spec-system.md <outputs>/00-spec-system-v1.0-superseded.md specs/tasks/
cp <outputs>/task-state-template.state.md specs/tasks/
cp <outputs>/specs-modules/*.spec.md specs/modules/        # the 11-aspect specs
cp <outputs>/roadmap.md specs/
# Migrate the scaffold's original 7 specs (they become modules too):
cp ../reference/scaffold/specs/*.spec.md specs/modules/
git checkout -b chore/spec-system && git add -A && git commit -m "spec system v1.1 (task 00)"
```

## 4. Verify the baseline (reproduce this session's measurements — trust nothing you didn't run)

```bash
cd ~/cognitive-os/polymath-os-android
git fetch --all
git log --oneline origin/main..origin/feat/ui-revamp-v4 | wc -l   # expect 33
cd frontend && (bun install || npm install) && npx jest 2>&1 | tail -3
#   expect: 243 passed, 7 failed (the 7 stale theme tests — Task 01 fixes them)
cd ../backend && uv venv && uv pip install -r requirements.txt httpx
docker run -d --name cog-mongo -p 27017:27017 -v cog-mongo-data:/data/db mongo:7
uv run uvicorn server:app --port 8001 --reload &   # needs a .env — tests expect port 8001; never commit .env
uv run pytest ../tests/ -q   # 22 integration tests — should pass WITH server+Mongo up
cd ../web && bun install && bunx playwright install --with-deps && bunx playwright test
#   expect: 67 tests across 3 spec files
```
Paste each result into your first state files as `last_verified`. If a number differs from the
branch-validation report, that's a finding — record it, don't shrug.

## 5. Parallel task mechanics

```bash
cd /d/cognitive-os/polymath-os-android
git worktree add ../worktrees/wt-02 -b task/02-rbac-port
git worktree add ../worktrees/wt-03 -b task/03-guardrails-port
# Open each worktree in its own VS Code window / agent session. Disjoint FILE SCOPEs = safe.
# After merge:  git worktree remove ../worktrees/wt-02
```

## 6. Secrets hygiene (the maaxly lesson, made a rule)
- `.env` files: NEVER committed. `.env.example` with empty values IS committed.
- maaxly's history contains deleted-env-file commits across three branches — that cleanup pain is
  the reason this is rule #1. `git log --all --diff-filter=D -- '*.env*'` on any repo before reuse.
