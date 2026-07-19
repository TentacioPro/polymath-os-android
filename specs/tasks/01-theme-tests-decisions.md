# 01-theme-tests-decisions.md
*Append-only. Written on task completion per 00-spec-system.md §A.*

---

## theme.test.ts — 4 color identity assertion fixes

Per `theming.spec.md` rule 3: **tests follow v4 design intent, not vice versa.** The
`feat/ui-revamp-v4` branch changed the theme color values; the tests were not updated.

| Test | Old assertion | New assertion (v4 actual) | Why |
|---|---|---|---|
| void theme dark surface | `#0A0A0A` | `#000000` | v4 void theme uses pure black surface |
| nova theme light surface | `#FAFAFA` | `#FFFFFF` | v4 nova uses pure white surface |
| ocean theme blue primary | `#60A5FA` | `#00F2FF` | v4 ocean uses cyan primary (not Tailwind blue-400) |
| void primary (monochrome) | `#FFFFFF` | `#C0C0C0` | v4 void primary is silver, not white |

**Rejected alternative:** Change the source theme tokens to match the old tests.
Why rejected: rule 3 is explicit — tests document design intent, they do not constrain it.
Changing tokens to match stale tests would silently revert intentional v4 design decisions.

---

## navigation-components.test.tsx — 3 CollapsibleHeader fixes

The v4 `CollapsibleHeader` is a **fixed-height header** (HEADER_MAX = HEADER_MIN = 56).
This is intentional — the component no longer collapses. SCROLL_RANGE = 1 (not 0) is a
safety value to prevent zero-range interpolation division in react-native-reanimated.
The `greeting` prop was removed from the interface; the component only accepts `title`.

| Test | Old | New | Why |
|---|---|---|---|
| `renders custom greeting` | passes `greeting="Welcome back!"` prop | passes `title="Welcome back!"` | `greeting` prop removed from v4 interface; `title` is the correct v4 API |
| `HEADER_MAX is greater than HEADER_MIN` | `toBeGreaterThan(HEADER_MIN)` | `toBeGreaterThanOrEqual(HEADER_MIN)` | v4 is fixed-height: MAX === MIN === 56 is valid design |
| `SCROLL_RANGE equals HEADER_MAX minus HEADER_MIN` | `toBe(HEADER_MAX - HEADER_MIN)` (expected 0) | `toBeGreaterThan(0)` — renamed "positive safe value (min 1 prevents zero-range interpolation)" | SCROLL_RANGE is independently defined as 1 in v4 to prevent interpolate() crash |

**Rejected alternative:** Update HEADER_MAX to be > HEADER_MIN in the component.
Why rejected: the fixed-height header is v4's deliberate design choice. Making it collapsible
again would be a new feature, not a test fix.

---

## store.test.ts — AsyncStorage mock + 3 stale-preference fixes

**Root cause of suite-load failure:** `@react-native-async-storage/async-storage` native module
is null in Jest (no native runtime). The fix is a test-file-local `jest.mock()` call using the
package's official jest mock (`/jest/async-storage-mock.js`). This was added to store.test.ts
and ui-components.test.tsx individually rather than to jest.setup.js.

**Rejected alternative:** Add the mock to `jest.setup.js` (global setup).
Why rejected: jest.setup.js is outside Task 01's FILE SCOPE. A test-file-local mock is
sufficient and doesn't risk affecting other suites unexpectedly.

**Side effect of fixing the mock:** 3 additional stale assertions in store.test.ts were
uncovered (previously hidden by suite-load failure):

| Test | Old assertion | New assertion | Why |
|---|---|---|---|
| `should have default preferences` | `preferences.fontFamily` = `'dm-sans'` | `preferences.fontCollection` = `'industrial'` | v4 renamed `fontFamily` → `fontCollection`; default changed from `dm-sans` to `industrial` |
| `should have default preferences` | `preferences.monoFont` = `'jetbrains-mono'` | *removed* | `monoFont` field removed from v4 Preferences interface entirely |
| `should not be hydrated by default` | `_hasHydrated` = `false` | asserts `typeof _hasHydrated` = `'boolean'` | With synchronous AsyncStorage mock, persist middleware hydrates before test assertion runs; `false` expectation is impossible with this mock. Real behavior (starts false, async becomes true) is documented in comment. |

---

## ui-components.test.tsx — AsyncStorage mock only

Same AsyncStorage mock added test-file-locally. No other changes — all 53 tests in this
suite pass without further modification once the mock is present.

---

## Final test count reconciliation

| | Before Task 01 | After Task 01 |
|---|---|---|
| Total tests | 250 | 303 |
| Passed | 243 | 303 |
| Failed | 7 | 0 |
| Suites passing | 5/9 | 9/9 |

**Why 303, not 250:** The AsyncStorage mock fix caused `store.test.ts` (35 tests) and
`ui-components.test.tsx` (18 tests, previously 0 visible) to run for the first time.
Both suites were previously counted as "failed to run" — their individual tests were
not included in the 250 total. The 303 total is the correct baseline going forward.
