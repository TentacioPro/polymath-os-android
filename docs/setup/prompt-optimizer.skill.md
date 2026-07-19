# SKILL — Prompt Optimizer (harness-agnostic)

*Install: drop this file in `specs/skills/` and tell any harness: "Before executing my next
message, rewrite it using prompt-optimizer.skill.md, show me the optimized version in ≤15 lines,
then execute THAT." Works in Claude Code, Kimi CLI harnesses, OpenAI-based agents, anything
that reads files. For big tasks ask it to show the rewrite for approval first; for small ones
let it rewrite silently.*

## What this skill does
Converts a rough instruction into an execution-grade prompt that minimizes failed tool calls,
wasted tokens, and scope drift. The optimizer NEVER changes intent — it sharpens it. If intent
is ambiguous, it picks the most reasonable reading and states it in one line (it does not stall).

## The rewrite template (target ≤20 lines)
```
GOAL: <one checkable outcome — "done when X">
CONTEXT: <files to READ FIRST, exact paths; never "the codebase">
SCOPE: <files/dirs allowed to change> | OUT: <explicitly untouchable>
VERIFY-FIRST: <1-3 commands to run BEFORE changing anything, to confirm current reality>
PLAN: <3-7 numbered steps, each ending in a checkable state>
DONE MEANS: <tests/commands that must pass + artifacts that must exist>
REPORT: <what to paste back: test output tails, diffs, state-file update>
BUDGET: <max tool calls or time before stopping to report; e.g. "≤25 tool calls">
```

## Rules the optimizer bakes in (these are what cut failed tool calls)
1. **Verify-then-act**: every plan starts by reading the files it will edit and running the
   relevant test/status command. Editing from memory of a file is the #1 failed-call cause.
2. **Absolute paths, exact names** — no "the config file". If unknown, step 1 is `find`/`ls`,
   not a guessed path.
3. **Batch reads, atomic writes**: read everything needed in one pass; prefer one coherent edit
   per file over many micro-edits (each re-read between edits is where staleness bites).
4. **Smallest sufficient diff**: forbid drive-by refactors; "improve while you're there" is
   scope drift, and scope drift is where tests break.
5. **Red before green** for any code task: name the test that fails first.
6. **Idempotency**: prefer commands safe to re-run (`mkdir -p`, `git switch -C` no; `--ff-only`
   yes); a retried step must not corrupt state.
7. **Checkpoint**: long tasks update the `.state.md` file at each plan step, so a crash or
   model switch loses one step, not the session.
8. **Stop conditions**: on 2 consecutive failures of the same approach, STOP and report with
   the exact error — never loop variations blindly (the token furnace).
9. **No invented facts**: anything not read from a file or command output this session is
   labeled assumption. Numbers (test counts, versions) must come from output, not memory.
10. **Output discipline**: return tails of outputs (last 10-20 lines), full output only on
    failure; no restating file contents back at me.

## Worked example
Rough: "fix the failing frontend tests"
Optimized:
```
GOAL: frontend Jest fully green (250/250) — done when `npx jest` exits 0.
CONTEXT: read frontend/__tests__/theme.test.ts, store.test.ts, ui-components.test.tsx,
navigation-components.test.tsx; specs/modules/theming.spec.md.
SCOPE: frontend/__tests__/** and frontend/src/theme* | OUT: any component logic, any other dir.
VERIFY-FIRST: npx jest 2>&1 | tail -15  (expect 243/7 per state file)
PLAN: 1 run+capture failures 2 read each failing assertion vs current theme tokens 3 decide
per theming.spec.md rule 3: tests follow the NEW v4 design intent 4 update assertions 5 rerun full suite.
DONE MEANS: 250/250 green; no src changes outside theme tokens; commit on task/01 branch.
REPORT: jest tail, diff stat, updated 01-*.state.md. BUDGET: ≤15 tool calls.
```
