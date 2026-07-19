# 01 — Fix Stale Theme-Identity & CollapsibleHeader Jest Tests

## GOAL
Bring the frontend Jest suite from 243/250 to 250/250 green. The 7 failing tests
were written against an older design state and must be updated to reflect the
`feat/ui-revamp-v4` design intent, per theming.spec.md rule 3.

## MODULE SPECS
- `specs/modules/theming.spec.md` rule 3 (tests follow v4 design intent — not the other way)

## REUSE MAP
None — test-file changes only.

## TDD CONTRACT
- Red: 7 tests fail before changes
- Green: 250/250 pass after changes
- Gate: full `npx jest` run with pasted tail output

## FILE SCOPE (for parallelism)
ONLY these files may be touched:
- `frontend/__tests__/theme.test.ts`
- `frontend/__tests__/navigation-components.test.tsx`
- `frontend/__tests__/store.test.ts` (diagnosis + test-file-local fix only)
- `frontend/__tests__/ui-components.test.tsx` (diagnosis + test-file-local fix only)
- `specs/tasks/01-theme-tests.state.md`
- `specs/tasks/01-theme-tests-decisions.md`

Anything in `frontend/src/` or `frontend/app/` beyond reading for context = STOP,
report back, open a new task.

## OUT OF SCOPE
- Changing any production source file to make tests pass
- Fixing test infrastructure (jest.config, babel, tsconfig) globally
- Any other test file

## DONE MEANS
- `npx jest` in frontend/ reports 250 passed, 0 failed
- 01-decisions.md written (per-test: what the old assertion was, what v4 intent is, why)
- state file updated to done
- branch pushed to origin
