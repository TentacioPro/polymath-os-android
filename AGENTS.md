# AGENTS.md — entry point for ANY coding agent (Claude Code, Hermes, PI, human)

You are working inside the Personal Cognitive OS build. Before touching anything:

1. Read `specs/tasks/00-spec-system.md` — the rules of this repo. Non-negotiable.
2. Find your assigned task: `specs/tasks/NN-<name>.md` and its `NN-<name>.state.md`.
3. If the state file has a `last_verified` block, re-run that suite FIRST and confirm you can
   reproduce it. If you can't, record the discrepancy in the state file and stop for review.
4. Follow the six-step loop: read → red → green → gate → record → update.
5. Work ONLY inside your task's FILE SCOPE. Out-of-scope edits are violations, not initiative.
6. Update the state file at every step boundary; commit it with the code, on branch
   `task/NN-<name>` in your own worktree.
7. Never claim something is built without pasted, reproducible test output. Never invent numbers.
   Never present AI-generated content about the owner's life or work as fact — provenance rules
   in `specs/modules/provenance.spec.md` apply to your commit messages and docs too.

Context files (attach/read if present): `personal_cognitive_os_plan_v6.md`,
`conversation_self_log.md`, `branch-validation-report.md`.
