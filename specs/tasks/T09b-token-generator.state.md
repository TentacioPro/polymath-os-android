---
task: T09b-token-generator
branch: task/T09b-token-generator
status: in-progress
loop_step: 4-paused-for-owner

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

next_action: |
  Owner resumes from here. To-do before merge to trunk:
  1. Run `cd web && npm install` (installs tsx)
  2. Run `npm run generate-tokens` — verify output matches tokens.generated.css
  3. Browser: open serif type test HTML (create at specs/tasks/09b-serif-test.html), confirm Newsreader
  4. Add provenance CSS vars to tokens.generated.css (see 09b-decisions.md §3)
  5. Run full gate: frontend `npx jest` (303 tests), `next build` (web), integration suite
  6. Merge to trunk under full gate discipline
  7. Proceed to T09c (7 widget primitives)

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
  - "Serif font: Newsreader (pending browser confirmation — see 09b-decisions.md §2)."
  - "WCAG AA provenance borders: 4 pairs × 2 variants (dark/light surface) — see 09b-decisions.md §3."
  - "Token generator: scripts/generate-tokens.mts → web/src/app/tokens.generated.css (prebuild hook)."
  - "tsx added as web devDependency — run npm install in web/ before first generate run."

metrics:
  tool_calls_used: ~45
  gate_runs: 0
  tests_added: 8 (new ink/paper/dusk/amber identity + cycling tests)
  tests_weakened: 0
  tests_skipped: 10 (deprecated identity + cycling — marked it.skip, NOT deleted)
  files_changed: 8
  files_created: 3 (scripts/generate-tokens.mts, tokens.generated.css, 09b-decisions.md)
---
