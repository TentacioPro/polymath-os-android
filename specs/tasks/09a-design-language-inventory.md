# T09a — Design Language Inventory
*Read-only token survey. No code changes. Source of truth for T09 (design-language unification task).*
*Completed: 2026-07-21. Both platforms read from live files on disk.*

---

## Source Files

| Platform | File | Role |
|---|---|---|
| **Shared** | `shared/design-tokens.ts` | Single source of truth — M3Palette interface, all palettes, typography, spacing, radii, elevation, motion, z-index |
| **Mobile (Expo)** | `frontend/theme/tokens.ts` | Re-exports from shared; adds ThemeTokens interface (fontDisplay/fontMono) |
| **Mobile (Expo)** | `frontend/theme/ThemeContext.tsx` | React context wiring |
| **Web (Next.js)** | `web/src/app/globals.css` | CSS custom properties (`--m3-*`) + Tailwind `@theme inline` bridge |
| **Web (Next.js)** | `web/src/lib/theme.ts` | Theme metadata (id, label, description, group, swatch) only |

---

## Token Groups

### 1. Theme Registry

7 themes — **identical theme IDs across both platforms** (unified, no mapping layer needed):

| ID | Mobile Label | Web Label | Group | Primary Accent |
|---|---|---|---|---|
| `void` | TRUE TECH VOID | VOID | dark | Silver `#C0C0C0` (mobile) / White `#FFFFFF` (web) |
| `nova` | NOVA LIGHT | NOVA | **light** | Slate `#1A1A1A` (mobile) / Near-black `#1A1A1A` (web) |
| `amber` | AMBER NEURAL | AMBER VOID | dark | Amber `#FFB800` |
| `ocean` | CYBER OCEAN | OCEAN DEPTH | dark | Cyan `#00F2FF` (mobile) / Blue `#60A5FA` (web) |
| `forest` | EMERALD FOREST | FOREST CANOPY | dark | Neon Green `#00FF88` (mobile) / Emerald `#34D399` (web) |
| `sunset` | CRIMSON BLAZE | SUNSET BLAZE | dark | Crimson `#FF4D4D` (mobile) / Orange `#FB923C` (web) |
| `midnight` | COSMIC MIDNIGHT | MIDNIGHT PURPLE | dark | Fuchsia `#FF00FF` (mobile) / Violet `#C084FC` (web) |

Default: `void`. Storage key (web): `polymath-theme`.

---

### 2. Color Palette Tokens (M3Palette interface)

Every theme exposes these 36 color slots. Mobile = JS objects in `shared/design-tokens.ts`. Web = CSS custom properties in `globals.css`.

```
# Primary role group (4 tokens)
primary, onPrimary, primaryContainer, onPrimaryContainer

# Secondary role group (4 tokens)
secondary, onSecondary, secondaryContainer, onSecondaryContainer

# Tertiary role group (4 tokens)
tertiary, onTertiary, tertiaryContainer, onTertiaryContainer

# Surface/tonal elevation ladder (7 tokens)
surface, surfaceDim, surfaceContainer, surfaceContainerHigh,
surfaceContainerHighest, onSurface, onSurfaceVariant

# Boundary (2 tokens)
outline, outlineVariant

# Inverse (2 tokens)
inverseSurface, inverseOnSurface

# Status (9 tokens)
error, onError, errorContainer
success, successContainer
warning, warningContainer
info, infoContainer

# Category colors (7 tokens — nested `categories` object on mobile; flat `--m3-cat-*` on web)
AI, News, Tools, Market, Research, Tutorial, Other
```

**Total per theme: 36 color tokens** (29 named + 7 category)

**Web CSS property naming convention:**
`--m3-{camelCase-as-kebab}` — e.g. `surfaceContainerHigh` → `--m3-surface-container-high`

---

### 3. Platform Palette Divergences (requires T09 alignment)

Divergences confirmed by reading both files. Same token name, different value:

| Token | Theme | Mobile | Web | Severity |
|---|---|---|---|---|
| `primary` | void | `#C0C0C0` (silver) | `#FFFFFF` (white) | High — void accent identity differs |
| `primary` | ocean | `#00F2FF` (cyan) | `#60A5FA` (blue) | High — different hue family |
| `primary` | forest | `#00FF88` (neon green) | `#34D399` (emerald) | Medium — same family, different saturation |
| `primary` | sunset | `#FF4D4D` (crimson) | `#FB923C` (orange) | High — different hue (red vs orange) |
| `primary` | midnight | `#FF00FF` (fuchsia) | `#C084FC` (violet) | High — different saturation |
| `surface` | void | `#000000` | `#0A0A0A` | Low — near-identical |
| `secondary` | amber | `#FF8A00` (orange) | `#4DB89A` (teal) | High — triadic divergence |
| `categories.*` | all | Theme-matched hues | Semantic palette (purple/blue/green) for void; theme-matched for others | Medium — void web uses semantic accents, mobile uses monochrome |

**Root cause:** Mobile palettes were designed first with tight spectral theory (triadic hue math); web CSS vars were written independently with different color philosophy for some themes. T09 must reconcile — either `shared/design-tokens.ts` becomes the single source and web CSS vars are generated from it, or an explicit platform-override table is documented as intentional.

---

### 4. Typography Scale

Source: `shared/design-tokens.ts` → `m3Typography`. Used identically by mobile (JS style objects) and web (via Tailwind utility classes backed by the same values).

| Token | fontSize | fontWeight | lineHeight | letterSpacing | Rule |
|---|---|---|---|---|---|
| displayLarge | 57 | 400 | 64 | -1.00 | Kole Jain -2% display tightening |
| displayMedium | 45 | 400 | 52 | -0.75 | |
| displaySmall | 36 | 400 | 40 | -0.50 | |
| headlineLarge | 32 | 400 | 36 | 0 | lh ≈1.13× (M3 was 1.33×, tightened) |
| headlineMedium | 28 | 400 | 32 | 0 | |
| headlineSmall | 24 | 400 | 28 | 0 | |
| titleLarge | 22 | 500 | 24 | 0 | |
| titleMedium | 16 | 500 | 20 | 0.15 | |
| titleSmall | 14 | 500 | 16 | 0.10 | |
| bodyLarge | 16 | 400 | 24 | 0.50 | lh = 1.5× |
| bodyMedium | 14 | 400 | 20 | 0.25 | |
| bodySmall | 12 | 400 | 16 | 0.40 | |
| labelLarge | 14 | 500 | 20 | 0.10 | lh ≈1.4× |
| labelMedium | 12 | 500 | 16 | 0.50 | |
| labelSmall | 11 | 500 | 16 | 0.50 | |

Mobile backward-compat aliases (in `frontend/theme/tokens.ts`):
`display` → displaySmall, `heading` → headlineMedium, `body` → bodyMedium, `caption` → labelMedium, `mono` → labelSmall

**Font families:**
- Display: SpaceGrotesk
- Body (user-selectable, 4 options): DM Sans (default), Inter, Outfit, SpaceGrotesk
- Mono (user-selectable, 2 options): JetBrainsMono (default), SpaceMono

---

### 5. Spacing (8-Point Grid)

Source: `m3Spacing` in `shared/design-tokens.ts`. Mobile only — web uses Tailwind's spacing scale.

| Token | Value | Use |
|---|---|---|
| xs | 4px | Icon gaps, dot separators, tight internal padding |
| sm | 8px | Related element gaps, compact list item padding |
| md | 16px | Card internal padding, unrelated element gaps |
| lg | 24px | Section internal padding, comfortable list gaps |
| xl | 32px | Section separation, modal padding |
| xxl | 48px | Major section breaks, page-level vertical rhythm |
| section | 64px | Large section separation (hero → content) |
| hero | 96px | Page-level top/bottom breathing room |

**Gap for T09:** Web does not expose these as CSS vars. Tailwind's `4/8/16/24/32/48` spacing matches, but no named token layer. T09 may want to add `--m3-spacing-*` CSS vars to `globals.css` for parity.

---

### 6. Radii (M3 Shape System)

Source: `m3Radii` in `shared/design-tokens.ts`. Mobile only as JS — web equivalent is implicit in Tailwind rounded-* classes.

| Token | Value | Use |
|---|---|---|
| none | 0 | |
| xs | 4px | |
| sm | 8px | |
| md | 12px | |
| lg | 16px | |
| xl | 28px | Cards, sheets, dialogs |
| 2xl | 32px | Large neural cards |
| full | 9999px | Pills, FABs, chips |

---

### 7. Elevation

**Mobile** — two sets in `shared/design-tokens.ts`:
- `m3Elevation` (dark): near-zero shadows; Z-axis encoded via HSL surface lightness
- `m3ElevationLight` (nova only): feather shadows, opacity ≤8%, max blur

**Web** — class-based `.elevation-{0-5}` in `globals.css`:
- Dark themes: `box-shadow: none` (same principle as mobile dark)
- Nova: feather box-shadows at each level (matches `m3ElevationLight` values)
- Transient (popovers, dropdowns, tooltips): `.elevation-transient` (web), `m3ElevationLight.transient` (mobile)

Both platforms share the underlying principle: **dark = HSL lightness encodes Z; light = thin shadows**.

---

### 8. Motion

Source: `m3Motion` in `shared/design-tokens.ts` (mobile JS) + `--m3-ease-*` / `--m3-duration-*` CSS vars (web).

**Easing (6 curves — identical across platforms):**
```
standard:        cubic-bezier(0.2, 0, 0, 1)
standardDecel:   cubic-bezier(0, 0, 0, 1)
standardAccel:   cubic-bezier(0.3, 0, 1, 1)
emphasized:      cubic-bezier(0.2, 0, 0, 1)   (same as standard)
emphasizedDecel: cubic-bezier(0.05, 0.7, 0.1, 1)
emphasizedAccel: cubic-bezier(0.3, 0, 0.8, 0.15)
```

**Duration (14 steps — mobile JS only; web uses 3 named CSS vars):**
```
short1–4:  50/100/150/200ms
medium1–4: 250/300/350/400ms
long1–4:   450/500/550/600ms
extraLong1–2: 700/800ms
```

**Web CSS vars:**
```
--m3-duration-micro:       150ms  (= short3)
--m3-duration-transition:  250ms  (= medium1)
--m3-duration-standard:    300ms  (= medium2)
--m3-tooltip-delay:        300ms
```

**Spring profiles (mobile Reanimated / Expo only):**
```
gentle:  { damping: 20, stiffness: 150, mass: 1 }
bouncy:  { damping: 12, stiffness: 200, mass: 0.8 }
snappy:  { damping: 18, stiffness: 300, mass: 0.6 }
stiff:   { damping: 30, stiffness: 400, mass: 1 }
```

---

### 9. Z-Index Scale (Mobile only)

Source: `m3ZIndex` in `shared/design-tokens.ts`. Web uses Tailwind z-* utilities.

| Token | Value | Component |
|---|---|---|
| base | 0 | |
| card | 1 | |
| stickyHeader | 10 | |
| fab | 20 | |
| navRail | 30 | |
| topBar | 40 | |
| overlay | 50 | |
| sheet | 60 | |
| dialog | 70 | |
| toast | 80 | |
| tooltip | 90 | |

---

### 10. Icon Sizing (Mobile — Iconometry Rule)

Source: `m3IconSize` + `iconSize()` in `shared/design-tokens.ts`.

```
xs: 16px  — labelSmall/labelMedium lineHeight
sm: 20px  — bodyMedium/labelLarge lineHeight
md: 24px  — bodyLarge/titleMedium lineHeight
lg: 32px  — headlineSmall area
xl: 40px  — headlineMedium area (stat rings, hero icons)
```

Rule: icon bounding box = adjacent text's computed lineHeight. Always pair with `alignItems: 'center'`.

---

### 11. Touch Targets (Mobile)

```
min: 44px          (WCAG 2.1 SC 2.5.5)
comfortable: 48px  (frequently-tapped targets)
```

---

### 12. Web-Only Tokens (no mobile equivalent)

| Token / Utility | Location | Purpose |
|---|---|---|
| `.glass-overlay` | globals.css | Modal scrim: `backdrop-filter: blur(12px) saturate(160%)` |
| `.glass-surface` | globals.css | Elevated floating panel: `blur(16px) saturate(180%)` + inner border |
| `.prose-line-cap` | globals.css | 72ch max-width for flowing text |
| `.prose-line-cap-tight` | globals.css | 60ch max-width |
| `.display-kerning` | globals.css | `-0.025em` (display text) |
| `.display-kerning-tight` | globals.css | `-0.030em` |
| `.cq-*` container query classes | globals.css | Compact (≤300px) / Medium (≤600px) / Expanded (≥601px) breakpoints |
| `.focus-ring` | globals.css | WCAG focus-visible ring: 2px `--m3-primary` offset 2px |
| `.tooltip-delayed` + `.tooltip-anchor` | globals.css | 300ms hover delay (Kole Jain Phase 4.4) |
| `color-scheme: dark/light` | globals.css | OS-level scheme hint per theme |

---

## Summary: Token Counts

| Category | Tokens | Platform |
|---|---|---|
| Color per theme | 36 (29 named + 7 category) | Both |
| Typography styles | 15 (+ 5 legacy aliases mobile-only) | Both |
| Spacing steps | 8 | Mobile JS only |
| Radii | 8 | Mobile JS only |
| Elevation levels | 6 (+1 transient for light) | Both |
| Motion easing | 6 | Both |
| Motion duration | 14 (mobile) / 3+1 named (web) | Both |
| Spring profiles | 4 | Mobile only |
| Z-index levels | 11 | Mobile only |
| Icon sizes | 5 | Mobile only |
| Web-specific utilities | ~15 | Web only |

---

## Gaps Flagged for T09

1. **Palette divergences** — 5+ themes have materially different primary colors between platforms (see section 3). T09 must decide: generate web CSS vars from `shared/design-tokens.ts`, or accept platform-specific palettes as intentional.

2. **Spacing/radii/z-index** — Mobile has named tokens; web relies on Tailwind implicit values. T09 may want `--m3-spacing-*` and `--m3-radius-*` CSS vars in globals.css for parity.

3. **Duration scale** — Mobile has 14 named duration steps; web exposes only 3 (micro/transition/standard). T09 may want to expose the full M3 duration ladder as CSS vars.

4. **Category colors (void theme)** — Web void uses semantic purple/blue/green; mobile void uses monochrome grays. Intentional or oversight? T09 to decide.
