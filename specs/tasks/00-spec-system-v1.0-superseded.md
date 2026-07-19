# 00 — The Spec System (how any agent takes a task end-to-end)

*This file defines the spec structure itself. It is `00` because every other numbered task spec
depends on it. Inspired by the pixovid spec ledger (numbered, append-only, decisions + learnings
recorded per session), adapted to this project's provenance and TDD rules.*

---

## Two spec layers, different jobs

### Layer 1 — Module specs (`specs/modules/`) — *living source of truth*
The existing seven files (`rbac`, `provenance`, `audit-log`, `data-layer`, `agent-layer`,
`validation-guardrails`, `api`), moved under `specs/modules/`, plus new ones as gaps are filled
(`error-contract`, `backup-restore`, `notifications`, per-sub-agent specs as they're built).

- One file per concern. Edited in place as the concern evolves — but **every edit is driven by a
  numbered task spec** (Layer 2), never ad hoc. The git commit for a module-spec change references
  the task number that caused it.
- A module spec without a matching test file is incomplete, per `docs/VERSIONING.md`.

### Layer 2 — Task specs (`specs/tasks/`) — *append-only chronological ledger*
The pixovid pattern. Each unit of work an agent (or you, or a cheaper model) picks up gets a
number and up to three files:

```
specs/tasks/
  NN-<task-name>.md            ← the ask (written BEFORE work starts)
  NN-<task-name>-decisions.md  ← what was actually built, choices made, alternatives REJECTED and why
  NN-<task-name>-learnings.md  ← optional: gotchas, bugs, patterns that only surfaced while building
```

- Numbers are sequential and never reused. Files are never edited after their session closes —
  corrections happen in a later numbered spec that references the old one (same rule as the audit
  log: append, never mutate).
- The `-decisions` file is mandatory for every completed task. The `-learnings` file is written
  whenever something non-obvious happened (a bug with a root cause worth remembering, a rejected
  approach, a dependency surprise).
- Ambiguity rule (from pixovid, matches the master prompt's GOAL rule): if the task spec leaves a
  high-impact choice open, the agent states its resolution as a "confirmed decisions" table at the
  top of the `-decisions` file — it does not silently guess, and it does not stall.

---

## The task spec template (copy this for every new `NN-*.md`)

```markdown
# NN — <Task name>

## GOAL
One concrete, checkable outcome. Not a direction.

## MODULE SPECS IN SCOPE
Which files under specs/modules/ govern this work. Read them first. If this task
changes a module spec, say which and why.

## REUSE MAP (mandatory — saves tokens, prevents parallel implementations)
| Existing asset | Where | How it's reused |
|---|---|---|
| e.g. auth.py (JWT, Argon2id) | polymath-os-android backend | extended, NOT reimplemented |

## TDD CONTRACT
1. Tests to write FIRST (names + what each asserts). Red before green.
2. Existing tests that must stay green (name the suites).
3. The "failing-forward" tests this task turns green (e.g. test_write_requires_kuzu_connection).

## GUARDRAIL / PROVENANCE REQUIREMENTS
- Provenance level(s) of anything this task writes to the graph.
- Which of the four guardrail checks apply to this task's outputs.
- What gets audit-logged, under which actor.

## OUT OF SCOPE
Explicitly. An agent that "helpfully" exceeds scope creates the drift this project exists to stop.

## DONE MEANS
- [ ] All TDD-contract tests green, no previously-green test broken
- [ ] NN-decisions.md written (with rejected alternatives)
- [ ] Module specs updated if behavior changed, commit references this task number
- [ ] Anything claiming "built/complete" is verifiably built — run the tests, paste the output
```

---

## The agent execution loop (every task, no exceptions)

1. **Read**: this file → the task spec → its module specs → the reuse map's actual code.
2. **Red**: write the TDD-contract tests; confirm they fail for the right reason.
3. **Green**: implement, reusing per the reuse map. No new parallel implementation of anything
   that already exists and passes tests.
4. **Gate**: run the FULL existing suites (backend Jest + agent-service pytest + any Playwright),
   not just the new tests. A task that breaks a cross-cutting test is not done.
5. **Record**: write `-decisions` (and `-learnings` if warranted). Tag every factual claim about
   what exists with its provenance level. "Tests pass" requires pasted test output —
   `verified_artifact`, not narrative.
6. **Update**: module specs if behavior changed; README status section if build-state changed.

---

## Initial task ledger (the corrected architecture plan, as numbered tasks)

Mapped 1:1 from `clean_end_to_end_architecture_plan.md` — these are the specs to write next,
in order:

| # | Task | Source |
|---|---|---|
| 01 | Merge feat/ui-revamp-v3 + v4 into main (polymath-os-android) | plan step 6 — do first, per the "which version is real" lesson |
| 02 | Port RBAC permission matrix (rbac.js pattern) into FastAPI backend | plan step 1 |
| 03 | Port guardrails.py four checks into FastAPI backend | plan step 1 |
| 04 | Extend existing audit logging to audit-log.spec.md schema | plan step 2 |
| 05 | Error contract + structured error propagation (backend → clients) | Qwen-doc adoption — see triage |
| 06 | Mongo → Kùzu/LanceDB migration against real collections | plan step 3 |
| 07 | Wire GraphStore to live Kùzu (turns test_write_requires_kuzu_connection green) | scaffold TODO |
| 08 | agent-service: orchestrator + first sub-agent (journal-capture) end-to-end | plan step 4 |
| 09 | Extend web/ + mobile/ with journal-capture + staging-confirmation screens | plan step 5 |
| 10 | Backup/restore ("Vault"): automated versioned snapshots + restore drill | Qwen-doc adoption — see triage |

Each of these gets its own full task-spec file (using the template) before an agent touches code.
