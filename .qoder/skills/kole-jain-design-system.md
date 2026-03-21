# Kole Jain Design System — Agent Skill

**Source**: Kole Jain Design Methodology (March 2026 Deep Research)
**Scope**: Applied to Polymath OS (web + mobile). Supersedes ad-hoc style decisions.

---

## Phase 1: Spatial Architecture & Layout Mechanics

### 8-Point Spatial Rhythm Configuration
**Trigger**: Any padding, margin, gap, or grid alignment decision.

Rules:
- Permitted values ONLY: `4, 8, 16, 24, 32, 48, 64, 96` px (or equivalent RN units)
- Internal padding: 8–16px
- Related element gaps: 8–16px
- Unrelated element gaps: 24–32px
- Section breaks: 48–96px
- NEVER use arbitrary primes (e.g., 13, 17, 23, 37px)
- Macro layout: Rule of Thirds + Fibonacci sequence for proportional balance

### Bento Grid Structuring & Content-Out Architecture
**Trigger**: Dashboard layouts, feature-rich pages.

Rules:
- Inventory all content units before placing anything
- Desktop: strict 12-column CSS Grid
- Mobile: strict 4-column grid
- Partition into modular 2×2 bento containers (`grid-template`, `minmax`, `auto-fit`)
- Visual flow: F-Pattern (reading) or Z-Pattern (scanning) — highest-priority metrics top-left

### Container-Query Responsive Adaptation
**Trigger**: Any reusable UI component (card, chip, list item, stat block).

Rules:
- REJECT viewport `@media` queries for internal component logic
- Use `container-type: inline-size` on component wrappers
- Define minimum 3 breakpoints per component:
  - Compact: `@container (max-width: 300px)`
  - Medium: `@container (max-width: 600px)`
  - Expanded: `@container (min-width: 601px)`

### Algorithmic Component Dimensioning
**Trigger**: Any interactive button, chip, input, or touch target.

Formula: `Target Width = Computed Height × 2`

Rules:
- Compute height from: text line-height + top padding + bottom padding
- Override ratio ONLY when needed to meet WCAG minimum touch target: 44×44px
- Apply to: M3Button, M3Chip, FAB, nav items, all interactive primitives

---

## Phase 2: Mathematical Typography & Iconometry

### Geometric Typography Scaling
**Trigger**: Any text system initialization or type token update.

Rules:
- Maximum 2 font families: 1 Sans-serif (UI body), 1 Display (headings/hero)
- Base size: 16px desktop / 14px mobile
- Scale formula: `size_n = base × ratio^(n-1)` with ratio = 1.25x
- Applied to Polymath type scale:
  - labelSmall: 10px, labelMedium: 12px, labelLarge: 14px (mobile base)
  - bodyMedium: 14px, bodyLarge: 16px
  - titleMedium: 16px, titleLarge: 20px
  - headlineSmall: 24px, headlineMedium: 28px, headlineLarge: 32px
  - displaySmall: 36px, displayMedium: 45px
- Line length cap: 60–75 characters per line (apply `max-ch` or `maxWidth`)

### Hierarchical Line Height & Kerning
**Trigger**: Any text rendering.

Rules:
- Body text: `lineHeight = fontSize × 1.5`
- Small/caption text: `lineHeight = fontSize × 1.4`
- Headings: `lineHeight = fontSize × 1.15` (range 1.1–1.2)
- Display text only: `letterSpacing = -0.02em` to `-0.03em` (tighten large headlines)
- Body and below: `letterSpacing = 0` (no tracking adjustments)

### Iconometry & Vertical Rhythm Synchronization
**Trigger**: Any icon placed adjacent to text.

Rules:
- Icon bounding box = adjacent text's computed `lineHeight` in px (not fontSize)
- Example: 16px font, 1.5× line-height → 24px icon box
- Always use `alignItems: center` / `align-items: center` to eliminate sub-pixel drift
- Icon library: Lucide or Phosphor vectors ONLY — NO Unicode emoji as system icons

---

## Phase 3: Color Systems & Dimensional Physics

### 4-Layer Semantic Color Architecture
**Trigger**: Any color variable, theme, or palette generation.

Layers (maps to M3 token names):
- Layer 1 — Background canvas: `surface`, `surfaceDim`
- Layer 2 — Elevated surfaces: `surfaceContainer`, `surfaceContainerHigh`, `surfaceContainerHighest`
- Layer 3 — Text & Icons: `onSurface` (87% opacity primary), `onSurfaceVariant` (60% opacity secondary), disabled (38% opacity tertiary)
- Layer 4 — Accents & CTAs: `primary`, `primaryContainer`, `onPrimary`, `onPrimaryContainer`

Text opacity cascade (dark themes):
- Primary text: 87% (`onSurface` at 0.87 alpha)
- Secondary text: 60% (`onSurfaceVariant` at 0.60 alpha)
- Tertiary/disabled: 38% (0.38 alpha)

Color harmony: Triadic — derive secondary and tertiary accent colors from 120° rotations of the primary hue.

### HSL Dark Mode Physics (Zero-Shadow Elevation)
**Trigger**: Dark theme token generation.

Rules:
- ALL `box-shadow` / `shadowColor` properties → zero / removed
- Z-axis elevation encoded ONLY via HSL Lightness:
  - Base canvas: `L ≤ 15%` (e.g., hsl(220, 10%, 8%))
  - Each elevation step up: `L + 3–5%`
  - surfaceContainer = base + 4%, surfaceContainerHigh = base + 8%, surfaceContainerHighest = base + 12%
- Accent colors in dark mode: desaturate by 15–20% to prevent retina halation
- Text inside chips/containers: always invert relative to container (ensure Layer 3/4 contrast)

### High-Fidelity Light Mode Depth
**Trigger**: Light theme elevation (Nova theme).

Rules:
- Shadows nearly invisible: max blur radius, opacity ≤ 8%
- Example: `box-shadow: 0 8px 32px rgba(0,0,0,0.06)`
- Pronounced shadows ONLY for transient elements breaking the grid: dropdowns, popovers, tooltips
- Elevation via surface tinting (same HSL lightness principle, from high base L)

### Performance-Optimized Glassmorphism
**Trigger**: Modals, overlays, premium cards (export, agent persona, special surfaces).

Rules:
- `backdrop-filter: blur(12–20px)` + `1px rgba(255,255,255,0.08)` inside border + subtle inner shadow
- Total viewport covered by `backdrop-filter` elements: NEVER exceed 50%
- Fallback for unsupported renderers: `surfaceContainerHighest` solid bg

---

## Phase 4: Component States & Interaction Mechanics

### Exhaustive State Matrix Generation
**Trigger**: Any interactive UI primitive (button, chip, input, card, list item, FAB).

Every component MUST implement all 8 states:

| State | Visual Delta |
|---|---|
| Default | Baseline |
| Hover | `scale(1.02)` + `brightness(1.05)` + expanded shadow |
| Active/Pressed | `scale(0.98)` + inset shadow |
| Focus | 2px semantic ring (`outline`/`primary` color) |
| Disabled | `opacity: 0.5` + grayscale background, `pointer-events: none` |
| Loading | Continuous shimmer mask (skeleton animation) |
| Error | Semantic error tint (`errorContainer` bg) |
| Success | Semantic success tint (`successContainer` bg) |

### Cognitive Interruption Routing (Hick's Law)
**Trigger**: Any user action that triggers a UI overlay.

Decision matrix:
- Simple task (≤ 2 inputs), non-destructive, needs dashboard context → **Popover** (non-blocking)
- Complex task (> 2 inputs), destructive (delete), or new workflow → **Full-screen Modal** (background blurred, forced focus)
- Applied in Polymath OS: delete confirm → M3Dialog (modal); quick AI config → Popover; new journal entry → M3BottomSheet (half-height)

### Optimistic UI State Representation
**Trigger**: Any mutation operation (create, update, delete).

Pattern:
1. User triggers action
2. INSTANTLY mutate local state (remove item from list, show success state)
3. Fire success Toast
4. Submit async API call
5. On non-200 response: revert local state + fire error Toast
6. Applied everywhere: activity delete, journal save, connection generate, export

### Micro-Interaction Timing & Easing
**Trigger**: Any animation or transition.

Timing rules:
- Micro-interactions (icon swap, state change, ripple): **150–200ms**
- Component transitions (sheet open, modal enter, route change): **200–300ms**
- Hover-tooltip appearance delay: **300ms** (prevents accidental triggers)
- Entering elements: `ease-out` (fast start, soft landing)
- Exiting elements: `ease-in` (gentle start, fast exit)
- M3 mapping: `emphasized` = cubic-bezier(0.2, 0, 0, 1), `standard` = cubic-bezier(0.2, 0, 0, 1)

---

## Phase 5: Accessibility, Performance & Anti-Vibe Enforcement

### Accessibility-First Semantic Generation
**Trigger**: All DOM/component structure decisions.

Rules:
- Actions use `<button>` / `TouchableOpacity` / `Pressable`; navigation uses `<a>` / `router.push`
- Keyboard tab-index order verified on all interactive surfaces
- Text contrast: minimum **4.5:1** (WCAG AA)
- Component boundary contrast: minimum **3:1**
- `@media (prefers-reduced-motion)` → all transition durations set to `0.01ms`
- `accessibilityLabel` / `aria-label` on all icon-only buttons

### Performance-Conscious Effect Auditing
**Trigger**: Any CSS/RN animation or transition review.

Rules:
- PERMITTED: `transform` (translate, scale, rotate) and `opacity` ONLY
- FORBIDDEN for animation: `width`, `height`, `margin`, `padding`, `top`, `left`, `right`, `bottom`
- RN equivalent: use `useAnimatedStyle` with `useSharedValue` (Reanimated) — never animate layout props
- Audit `backdrop-filter` usage: cap at <50% viewport coverage

### Vibe-Code Suppression & Normalization
**Trigger**: Post-generation audit of any UI code.

Checklist:
- [ ] No Unicode emoji used as UI icons → replace with Lucide/Phosphor vectors
- [ ] No hyper-saturated hex codes (saturation > 90%) → mathematically desaturate
- [ ] No "dead cards" (cards with no actionable content) → collapse or inject real data
- [ ] No lorem ipsum → inject realistic Polymath-context placeholder data (e.g., "Neural network analysis complete — 14 new connections found")
- [ ] No hardcoded `#000` / `#FFF` / `#888` → all values from M3 theme tokens

---

## Phase 6: System Architecture & Handoff

### Atomic to Molecular API Construction
**Trigger**: Finalizing or documenting a component for use across the codebase.

Rules:
- Build from tokens → atoms → molecules → organisms
- Every component must define: Props interface, default values, slot/children API, constraint documentation
- Every data container must have a corresponding Empty State with:
  - Explanation (why is it empty?)
  - Resolution CTA (what action fills it?)
  - Themed illustration using `primary`/`primaryContainer` colors

Token-to-component traceability matrix must be maintained in `shared/design-tokens.ts`.

### High-Fidelity Spatial Presentation
**Trigger**: Design reviews, stakeholder presentations, portfolio exports.

Two modes:
- **Creative/Portfolio**: `transform: perspective(1000px) rotateX(2deg) rotateY(-14deg)` + Z-offset sub-components + high-blur drop shadows → exploded collage effect
- **Enterprise/Stakeholder**: Flat UI integrated into AI-generated environmental lifestyle mockups (realistic desk/device context)
