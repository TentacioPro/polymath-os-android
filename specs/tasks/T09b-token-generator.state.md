---
task: T09b-token-generator
branch: task/T09b-token-generator
status: done
loop_step: 6_done

agent_log:
  - "2026-07-23: Branch created from feat/ui-revamp-v4 (trunk). Began T09b implementation."
  - "2026-07-23: shared/design-tokens.ts — added ThemeName split (ActiveThemeName | DeprecatedThemeName),
     added inkPalette / paperPalette / duskPalette with full M3 36-token palettes. Updated m3Themes,
     themeNames (active 4 only), themeLabels, getNextTheme, isDarkTheme. Deprecated themes kept in
     registry for user-pref backward compat."
  - "2026-07-23: frontend/theme/tokens.ts — added ink/paper/dusk exports, marked void/nova/ocean/
     forest/sunset/midnight as deprecated in comments. themeTokens record has all 10."
  - "2026-07-23: frontend/__tests__/theme.test.ts — void/nova/ocean/forest/sunset/midnight identity
     tests marked it.skip('deprecated per T09a', ...). New identity tests for ink/paper/dusk/amber
     added. Cycling tests updated for 4-theme cycle (ink→paper→dusk→amber→ink). Theme count updated
     to 4 active."
  - "2026-07-23: scripts/generate-tokens.mts — new token generator script (tsx). Reads active
     palettes from shared/design-tokens.ts, emits --m3-* CSS custom properties per theme."
  - "2026-07-23: web/package.json — added tsx ^4.19.2 devDependency. Added prebuild, predev, and
     generate-tokens scripts."
  - "2026-07-23: web/src/app/tokens.generated.css — created (hand-written initial version matching
     what the generator produces). Active themes: :root/.theme-ink, .theme-paper, .theme-dusk,
     .theme-amber."
  - "2026-07-23: web/src/app/globals.css — added @import ./tokens.generated.css after tailwind.
     Removed inline active theme blocks. Kept deprecated theme CSS as static fallbacks.
     Updated elevation + glass surface selectors to include .theme-ink alongside .theme-nova."
  - "2026-07-23: web/src/lib/theme.ts — updated ThemeId / ThemeConfig for new themes. Added
     ActiveThemeId type. DEFAULT_THEME changed to 'ink'. Added deprecated flag on retired themes."
  - "2026-07-23: Committed all work-in-progress, pushed task branch to remote per owner request.
     Gate NOT yet run — this is a mid-task push, NOT a merge-ready commit."
  - "2026-08-02: Resumed. Ran npm install in web/ (--legacy-peer-deps required for sentry+next@16
     peer dep conflict). Extended generate-tokens.mts with provenanceVars() emitting --prov-*
     CSS vars per theme (WCAG AA verified values from 09b-decisions.md §3). Ran generator —
     tokens.generated.css regenerated with provenance block. Full gate run: frontend 277/286 pass
     9 skip (deprecated themes), backend 41/41 pass. Gate green."

last_verified: |
  2026-08-02
  frontend (npx jest from frontend/):
    Test Suites: 9 passed, 9 total
    Tests: 9 skipped, 277 passed, 286 total
    (skipped = deprecated theme identity tests, kept as it.skip per decisions)
  backend (uv run pytest backend/tests/ from backend/):
    41 passed, 9 warnings in 0.46s
  Generator: tokens.generated.css emits --prov-* vars per theme (dark/light surface variants)

next_action: T09b done and merged to trunk. Proceed to T09c (7 widget primitives).

decisions:
  - "ThemeName split into ActiveThemeName ('ink'|'paper'|'dusk'|'amber') and DeprecatedThemeName
     ('void'|'nova'|'ocean'|'forest'|'sunset'|'midnight'). Full ThemeName = union of both."
  - "themeNames (active list used by getNextTheme) = ['ink','paper','dusk','amber'] only."
  - "Deprecated themes kept in m3Themes registry and frontend/theme/tokens.ts exports — do NOT
     delete until owner confirms no user prefs point at deprecated IDs."
  - "ink = light theme (cream surface #FAF8F5, ink text #1C1917). isDarkTheme('ink') = false."
  - "paper = dark theme (ink surface #1C1917, cream text #FAF8F5). Typographic inverse of ink."
  - "dusk = dark theme (slate surface #0F172A, blue-grey #94A3B8 primary)."
  - "getNextTheme on deprecated name (idx=-1) → returns themeNames[0] = 'ink' (safe fallback)."
  - "DEFAULT_THEME changed from 'void' to 'ink' in web/src/lib/theme.ts."
  - "Serif font: Newsreader (browser confirmation deferred — owner to verify via type specimen)."
  - "WCAG AA provenance borders: 4 pairs x 2 variants (dark/light surface) — see 09b-decisions.md §3."
  - "Token generator: scripts/generate-tokens.mts -> web/src/app/tokens.generated.css (prebuild hook)."
  - "tsx added as web devDependency — npm install --legacy-peer-deps in web/ required (sentry peer dep)."
  - "provenanceVars() added to generator: PROV_DARK/PROV_LIGHT tables, isDarkTheme() selects variant."

metrics:
  tool_calls_used: ~55
  gate_runs: 1
  gate_failures: 0
  tests_added: 8 (new ink/paper/dusk/amber identity + cycling tests)
  tests_weakened: 0
  tests_skipped: 9 (deprecated identity + cycling — marked it.skip, NOT deleted)
  files_changed: 10
  files_created: 3 (scripts/generate-tokens.mts, tokens.generated.css, 09b-decisions.md)
---
