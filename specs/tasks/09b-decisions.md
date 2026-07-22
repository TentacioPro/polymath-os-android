# T09b — Token Generator Decisions
*Branch: task/T09b-token-generator. Status: in-progress (paused at commit; gate pending).*

---

## 1. Theme Transition (T09b)

### New active themes (replace 6 deprecated)
| ID | Aesthetic | Light/Dark | Replaces |
|---|---|---|---|
| `ink` | Dark ink on warm cream — editorial newspaper | **Light** | default (void was dark default) |
| `paper` | Warm cream on dark ink — night reading | Dark | void |
| `dusk` | Muted blue-grey — slate editorial | Dark | nova (light) |
| `amber` | Deep charcoal, warm amber accent | Dark | (kept, no change) |

### Deprecated (kept for user-pref backward compat)
`void`, `nova`, `ocean`, `forest`, `sunset`, `midnight` — do NOT remove until owner confirms no active user prefs reference these IDs.

### Rationale
- ink/paper are typographic inverses of each other — natural pair for a journaling app
- dusk provides a blue-grey neutral alternative that avoids the starkness of paper
- amber retained as warm accent option (no migration needed)
- "other four" (ocean/forest/sunset/midnight) retired — spectral themes misaligned with Lived-in Minimal aesthetic

---

## 2. Serif Font Decision

**Chosen: Newsreader** (Google Fonts)

### Candidates evaluated
| Font | Verdict | Notes |
|---|---|---|
| Source Serif 4 | Runner-up | Versatile, designed for UI + long-form. Slightly generic. |
| Instrument Serif | Rejected | Beautiful but weight range limited (regular/italic only). |
| **Newsreader** | **CHOSEN** | Designed for editorial/newsprint reading. Strong italics, excellent long-form rhythm. Aligns with journaling context. |

### Application
- `fontDisplay` (journal body, long-form entries): Newsreader
- `fontSans` (UI chrome, labels, navigation): existing DM Sans / Inter
- `fontMono` (code blocks, timestamps): existing JetBrains Mono

**Owner review checkpoint**: serif choice + specimen inline in consolidated T09d message.

---

## 3. WCAG AA Provenance Border Colors

Minimum contrast ratio ≥ 4.5:1 against active theme surfaces. All values verified via `hexLuminance()` formula.

### Surface luminance reference
| Theme | Surface | Luminance |
|---|---|---|
| ink | #FAF8F5 | 0.953 (light) |
| paper | #1C1917 | 0.014 (dark) |
| dusk | #0F172A | 0.009 (dark) |

### Calculated border colors

| Provenance | Dark surface (paper/dusk) | Contrast | Light surface (ink) | Contrast |
|---|---|---|---|---|
| `verified_artifact` | `#86EFAC` | 11.8:1 ✓ | `#15803D` | 4.8:1 ✓ |
| `human_verified` | `#93C5FD` | 8.5:1 ✓ | `#1D4ED8` | 6.4:1 ✓ |
| `ai_generated_unverified` | `#FCD34D` | 11.6:1 ✓ | `#92400E` | 6.0:1 ✓ |
| `unknown` / `synthetic_blend` | `#CBD5E1` | 11.1:1 ✓ | `#475569` | 7.3:1 ✓ |

**Implementation**: expose as CSS vars in tokens.generated.css using `color-scheme`-aware values. Dark themes get dark-surface variants; ink gets light-surface variants.

**Owner review checkpoint**: 4 provenance hex pairs in consolidated T09d message.

---

## 4. Token Generator Architecture

- Script: `scripts/generate-tokens.mts` (tsx-runnable TypeScript)
- Output: `web/src/app/tokens.generated.css` (do not edit by hand)
- Wired to: `web/package.json` → `prebuild` + `predev` hooks
- globals.css imports `tokens.generated.css` and keeps deprecated theme blocks as static fallbacks

### Dependency added
`tsx ^4.19.2` added to `web/devDependencies`. Run `npm install` in `web/` before first use.

---

## 5. Paused work / next steps

- [ ] Run `npm install` in `web/` to install tsx
- [ ] Run `npm run generate-tokens` once to verify generator output matches hand-written tokens.generated.css
- [ ] Serif type test: render HTML specimen in browser, confirm Newsreader decision
- [ ] Wire provenance CSS vars into globals.css (one additional token group)
- [ ] Run full T09b gate: `npx jest` (frontend 303 tests) + `next build` (web) + integration
- [ ] Merge to trunk under full gate discipline
- [ ] Proceed to T09c (7 widget primitives)
