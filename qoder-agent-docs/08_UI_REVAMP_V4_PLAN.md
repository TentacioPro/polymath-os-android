# UI/UX Revamp V4 — Material You × Kole Jain Design System

**Branch**: `feat/ui-revamp-v4`
**Date**: 2026-03-21
**Builds on**: `feat/ui-revamp-v3` (M3 component library, all screens, auth pages, 303 tests)
**Design Authority**: Material You M3 tonal system + Kole Jain Design Methodology
**Skill Reference**: `.qoder/skills/kole-jain-design-system.md`

---

## Design Mandates (Non-Negotiable)

These override any prior decision in v3:

| Rule | Mandate |
|---|---|
| Spacing | 8pt grid ONLY: 4, 8, 16, 24, 32, 48, 64, 96px |
| Grid | 12-col desktop / 4-col mobile bento layout |
| Responsiveness | Container queries (`container-type: inline-size`) not `@media` for components |
| Button sizing | Width = Height × 2, minimum 44×44px touch target |
| Type scale | Modular 1.25x ratio, 2 font families max |
| Line height | Body 1.5×, small 1.4×, headings 1.1–1.2× |
| Icon sizing | Icon box = adjacent text lineHeight in px |
| Icon library | Lucide / Phosphor only — NO Unicode emoji as icons |
| Color | 4-layer semantic: BG / surfaces / text-icons / accents |
| Dark elevation | HSL-only: base ≤15% L, +3–5% per Z step — NO shadows |
| Text opacity | 87% primary / 60% secondary / 38% disabled |
| States | All 8 states: Default/Hover/Active/Focus/Disabled/Loading/Error/Success |
| Animations | `transform` + `opacity` ONLY — no layout property transitions |
| Timing | Micro 150–200ms / Transitions 200–300ms / ease-out enter / ease-in exit |
| Interruption | Hick's Law: simple→Popover, complex/destructive→Modal |
| Mutations | Optimistic UI everywhere: instant state + async revert |
| Anti-vibe | No emoji icons, no hyper-saturated hex, no dead cards, no lorem ipsum |
| Contrast | WCAG 4.5:1 text, 3:1 component boundary |

---

## What Changed from V3 → V4

V3 delivered the full M3 component library and screen revamp. V4 applies Kole Jain's mathematical precision on top:

| Area | V3 State | V4 Correction |
|---|---|---|
| Spacing | Mixed arbitrary values (14, 18, 22px spotted) | Audit + snap all to 8pt grid |
| Typography | M3 type scale tokens defined | Apply 1.25× modular formula, verify all sizes, add line-height rules |
| Icons | Mixed: Ionicons + some emoji fallbacks | Full audit → Lucide/Phosphor, iconometry sizing |
| Component states | Default + basic active states | Full 8-state matrix on every interactive primitive |
| Mutations | Some screens: native refresh after save | Optimistic UI pattern across all CRUD operations |
| Responsiveness | @media queries for web components | Migrate components to container queries |
| Animation | Some layout property transitions present | Audit + strip non-transform/opacity animations |
| Elevation (dark) | M3 tonal (conceptual) | HSL-explicit: base L, per-step delta, verified |
| Empty states | EmptyState component created | Wire everywhere, every data container has resolution CTA |
| Dead cards | Some placeholder stat blocks in dashboard | Remove or wire to real data |

---

## Phase 0: Design Token Precision Audit

**Goal**: Bring `shared/design-tokens.ts` and `frontend/theme/tokens.ts` to full Kole Jain compliance.

### 0.1 Spacing Audit
- Grep all padding/margin/gap values in `frontend/app/` and `web/src/`
- Flag any value NOT in `[4, 8, 16, 24, 32, 48, 64, 96]`
- Replace with nearest legal value
- Add `spacing` constants to `shared/design-tokens.ts`:
  ```ts
  export const m3Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, section: 64, hero: 96 } as const;
  ```

### 0.2 Typography Token Formula Verification
Apply modular scale `size_n = base × 1.25^(n-1)`:

| Token | Mobile (base 14px) | Desktop (base 16px) |
|---|---|---|
| labelSmall | 10 | 11 |
| labelMedium | 12 | 13 |
| labelLarge | 14 | 14 |
| bodyMedium | 14 | 16 |
| bodyLarge | 16 | 18 |
| titleMedium | 18 | 20 |
| titleLarge | 20 | 25 |
| headlineSmall | 22 | 25 |
| headlineMedium | 28 | 32 |
| headlineLarge | 32 | 40 |
| displaySmall | 36 | 45 |

Add line-height rules to every token:
```ts
export const m3LineHeight = {
  body: (fontSize: number) => fontSize * 1.5,
  small: (fontSize: number) => fontSize * 1.4,
  heading: (fontSize: number) => fontSize * 1.15,
};
```

### 0.3 Dark Mode HSL Verification
Verify each dark theme uses HSL-derived surfaces (no hardcoded arbitrary dark hex):
- Void theme: base `hsl(0, 0%, 7%)` → surfaceContainer `hsl(0, 0%, 11%)` → surfaceContainerHigh `hsl(0, 0%, 15%)` → surfaceContainerHighest `hsl(0, 0%, 19%)`
- Repeat for all 6 dark themes with their hue/saturation
- Text opacity: update token comments to document 87/60/38 cascade

### 0.4 Button Dimension Formula
Add computed dimension check to `M3Button.tsx` and `M3Chip.tsx`:
- Height defined by: `paddingVertical × 2 + lineHeight`
- Width fallback: `height × 2` (overridden by content width when content is wider)
- Assert all touch targets ≥ 44px

**Files**: `shared/design-tokens.ts`, `frontend/theme/tokens.ts`, `web/src/app/globals.css`, `frontend/components/ui/M3Button.tsx`, `frontend/components/ui/M3Chip.tsx`

---

## Phase 1: Spacing + Icon Audit (Codebase-Wide)

**Goal**: Zero non-8pt spacing values. Full iconometry compliance.

### 1.1 Spacing Grep + Replace
```
# Find offenders
grep -rn "padding.*: [0-9]*" frontend/app/ --include="*.tsx"
```
Replace all non-8pt values. Document any intentional exceptions with `// kj-exception: [reason]`.

### 1.2 Icon System Migration
- Audit all `Ionicons` usage in `frontend/`
- Migrate to `lucide-react-native` (or keep Ionicons but enforce iconometry sizing rule)
- Install: `npx expo install lucide-react-native`
- Web: `lucide-react` (already available via shadcn)
- Icon sizing rule: create `iconSize(textStyle)` utility:
  ```ts
  export const iconSize = (fontSize: number, lineHeightMultiplier = 1.5) =>
    Math.round(fontSize * lineHeightMultiplier);
  // iconSize(16) = 24, iconSize(14) = 21 → snap to 24, iconSize(12) = 18
  ```

### 1.3 Vibe Suppression Pass
Run checklist on every screen file:
- [ ] Replace emoji icon fallbacks with Lucide/Ionicons vector
- [ ] Remove lorem ipsum / placeholder strings → Polymath-context data
- [ ] Identify and remove dead cards (no data, no action, no navigation)
- [ ] Mute any hex with saturation >85% → route through theme token

**Files**: Every `frontend/app/*.tsx`, `web/src/app/**/*.tsx`, add `iconSize` util to `frontend/utils/`

---

## Phase 2: Exhaustive State Matrix Implementation

**Goal**: Every interactive primitive implements all 8 states.

### 2.1 M3Button State Matrix
Update `frontend/components/ui/M3Button.tsx` and `web/src/components/ui/M3Button.tsx`:

```
Default   → baseline bg, no transform
Hover     → scale(1.02), brightness(1.05), shadow +1 elevation level
Pressed   → scale(0.98), inset shadow
Focus     → 2px outline ring in `primary` color
Disabled  → opacity 0.5, bg grayscale, pointer-events none
Loading   → replace label with shimmer bar + spinner
Error     → errorContainer bg, error icon
Success   → successContainer bg, check icon (brief, then reset)
```

### 2.2 M3Card / List Item State Matrix
All tappable cards get:
- Hover: `surfaceContainerHigh` bg (from `surfaceContainer`)
- Pressed: scale(0.98) + slight brightness reduction
- Focus: `outline` ring

### 2.3 M3TextField State Matrix (already partially done — complete it)
- Unfocused: `outlineVariant` border
- Focused: `primary` border + floating label animated up
- Error: `error` border + error message below
- Disabled: 0.5 opacity, read-only cursor

### 2.4 M3Chip / Filter Chip State Matrix
- Inactive: `surfaceContainerHigh` bg
- Hover: `surfaceContainerHighest` bg
- Active: `primaryContainer` bg + check icon
- Pressed: scale(0.97)

**Files**: All `M3*.tsx` components (mobile + web)

---

## Phase 3: Optimistic UI Rollout

**Goal**: All mutation operations use instant DOM update + async revert pattern.

### 3.1 Activity Operations
`frontend/app/(tabs)/knowledge.tsx`, `web/src/app/activities/page.tsx`:
- Delete: remove from list instantly + success toast → revert on API error
- Create: add placeholder card instantly → update with real ID on success
- Update: apply changes visually first

### 3.2 Journal Operations
`frontend/app/journal.tsx`, `web/src/app/journal/page.tsx`:
- Save: instant "saved" indicator → silent background sync
- Delete: instant removal → revert on failure

### 3.3 Connections Generate
`frontend/app/(tabs)/mesh.tsx`, `web/src/app/connections/page.tsx`:
- Show AIProgress component immediately on "Generate"
- Optimistic count: "Generating..." badge while API is in flight
- On success: animate count badge in

### 3.4 Agent Memory CRUD
`frontend/app/agent.tsx`, `web/src/app/agent/page.tsx`:
- Create memory: instant list prepend
- Delete memory: instant removal with undo toast (5s window)

**Utility**: Add `useOptimisticList<T>` hook to `frontend/utils/` and `web/src/hooks/` that handles:
- `optimisticAdd`, `optimisticRemove`, `optimisticUpdate`
- `revertOnError(apiCall)` wrapper

---

## Phase 4: Container Query Migration (Web)

**Goal**: Web components use container queries, not viewport breakpoints.

### 4.1 Component-Level Migration
For each web component in `web/src/components/`:
- Wrap component root with `.component-container { container-type: inline-size; }`
- Replace internal `@media` with `@container` rules
- Priority: `M3Card`, `StatRing`, `AIProgress`, `SearchOverlay`, `ConnectionGraph`

### 4.2 Page-Level Grid
Dashboard (`web/src/app/page.tsx`): implement 12-column CSS Grid bento:
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px; /* 8pt grid */
}
.hero-section { grid-column: span 12; }
.stats-block  { grid-column: span 8; }
.quick-actions { grid-column: span 4; }
.activity-feed { grid-column: span 7; }
.mesh-preview  { grid-column: span 5; }
```

Mobile: 4-column equivalent via CSS Grid with `auto-fit, minmax(calc(50% - 8px), 1fr)`.

---

## Phase 5: Animation Performance Audit

**Goal**: Zero layout property transitions across the entire codebase.

### 5.1 Web Audit
Scan `web/src/app/globals.css` and all component files for:
- `transition: width`, `transition: height`, `transition: margin`, `transition: padding` → REMOVE
- `transition: max-height` (common accordion pattern) → replace with `transform: scaleY()` or `opacity`
- Keep: `transition: transform`, `transition: opacity`, `transition: color`, `transition: background-color`

### 5.2 Mobile Audit
Scan Reanimated `useAnimatedStyle` hooks:
- Ensure no `width`/`height` interpolation → replace with `transform: [{ scaleX }]` or `opacity`
- CollapsibleHeader: verify scroll animation uses only `translateY` + `opacity`
- M3BottomSheet: gesture uses `translateY` (correct) — verify

### 5.3 Reduced Motion
Web: add to `globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
Mobile: check `AccessibilityInfo.isReduceMotionEnabled()` in `ThemeContext.tsx` → skip animations when true.

---

## Phase 6: Empty State Completeness

**Goal**: Every data container has a wired EmptyState with explanation + CTA.

### 6.1 Inventory (screens without wired empty states)
- [ ] Knowledge tab: no activities → "Start capturing your knowledge"
- [ ] Journal: no entries → "Write your first reflection"
- [ ] Mesh: no connections → "Generate your first neural connections"
- [ ] Chat: no messages → "Ask Polymath anything"
- [ ] Agent memory: no memories → "Your agent hasn't learned anything yet"
- [ ] Alerts: no alerts → "You're all caught up"
- [ ] Search: no results → "No results for '[query]'"
- [ ] Export: no data → "Nothing to export yet"

### 6.2 EmptyState Component Update
`frontend/components/ui/EmptyState.tsx` + `web/src/components/ui/EmptyState.tsx`:
- Each variant gets contextual icon (Lucide), title, description, CTA button
- CTA routes to the creation action for that screen
- Gentle floating animation on illustration (translateY oscillation, 0.5 opacity swing)

---

## Phase 7: Cognitive Interruption Routing

**Goal**: Apply Hick's Law to all dialog/modal triggers.

### 7.1 Decision Matrix Implementation

| Action | Complexity | Destructive | → Pattern |
|---|---|---|---|
| Rename activity | Simple (1 input) | No | Popover / inline edit |
| Delete activity | 0 inputs | YES | M3Dialog (modal) |
| Add tag | Simple (1 input) | No | Popover |
| Generate connections | 0 inputs | No | Inline AIProgress |
| Export settings | 3+ inputs | No | M3BottomSheet (half) |
| Clear all memories | 0 inputs | YES | M3Dialog (modal) with strong warning |
| AI config | 2 inputs | No | M3BottomSheet |

### 7.2 Popover Component
New file: `frontend/components/ui/Popover.tsx` + `web/src/components/ui/Popover.tsx`
- Non-blocking, anchors to trigger element
- `surfaceContainerHighest` bg, 16px corners, elevation 3
- Dismisses on outside tap / blur
- No scrim overlay (non-blocking)

---

## Phase 8: Bento Dashboard Revamp

**Goal**: Dashboard implements proper content-out bento grid with F-pattern flow.

### 8.1 Mobile Dashboard (`frontend/app/(tabs)/index.tsx`)
Content inventory (F-pattern, left-to-right, top-to-bottom):
1. Greeting hero + insight pills (full width)
2. Stat rings row (activities, journals, connections) — horizontal scroll
3. [2-col row] Streak bento (left) + Quick capture bento (right)
4. Recent activity feed (full width, feed cards)
5. Mesh preview card (full width)

Spacing:
- Section gaps: 24px (unrelated)
- Card internal padding: 16px
- Insight pill gaps: 8px

### 8.2 Web Dashboard (`web/src/app/page.tsx`)
12-column bento:
- Row 1 (span 12): Hero greeting + insight pills
- Row 2: Stats (span 8) + Quick capture (span 4)
- Row 3: Activity feed (span 7) + Mesh preview (span 5)
- Row 4: AI suggestions (span 6) + Streak/journal preview (span 6)

All sections: F-pattern priority (most important top-left).

---

## Implementation Order

```
Phase 0  [Day 1]      Token precision audit — spacing, type, HSL, button formula
Phase 1  [Day 2]      Spacing + icon audit codebase-wide
Phase 2  [Days 3-4]   State matrix — all M3 components (8 states)
Phase 3  [Days 5-6]   Optimistic UI — all mutation operations
Phase 4  [Day 7]      Container queries — web components + bento grid
Phase 5  [Day 8]      Animation performance audit
Phase 6  [Days 9-10]  Empty state completeness
Phase 7  [Day 10]     Cognitive interruption routing + Popover component
Phase 8  [Day 11]     Bento dashboard revamp (mobile + web)
```

---

## File Change Summary

| Phase | Files Changed | Key Deliverables |
|---|---|---|
| 0 | `shared/design-tokens.ts`, `theme/tokens.ts`, `globals.css`, `M3Button`, `M3Chip` | Spacing constants, type formula, HSL audit |
| 1 | All screen files (~30), new `iconSize` util | Zero non-8pt values, Lucide migration, vibe pass |
| 2 | All `M3*.tsx` components (mobile + web, ~20 files) | Full 8-state matrix |
| 3 | All CRUD screens (~10), new `useOptimisticList` hook | Optimistic UI everywhere |
| 4 | Web components + `page.tsx`, `globals.css` | Container queries, bento grid |
| 5 | `globals.css`, `ThemeContext.tsx`, animated components | Performance-clean animations |
| 6 | `EmptyState.tsx` (mobile + web), all data screens | Fully wired empty states |
| 7 | New `Popover.tsx` (mobile + web), dialog call sites | Hick's Law routing |
| 8 | `index.tsx`, `web/page.tsx` | Bento dashboard |
| **Total** | **~70 files** | **Kole Jain compliance across entire UI** |

---

## Progress Tracking

| Phase | Status | Commit |
|---|---|---|
| 0 — Token Precision Audit | DONE | 7a22a15 |
| 1 — Spacing + Icon Audit | DONE | cfe6164 |
| 2 — State Matrix | DONE | 7909e53 + d29b262 |
| 3 — Optimistic UI | DONE | 45112aa |
| 4 — Container Queries | DONE | da686eb |
| 5 — Animation Audit | DONE | 8adc49c |
| 6 — Empty States | DONE | 11ef783 |
| 7 — Interruption Routing | DONE | — |
| 8 — Bento Dashboard | PARTIAL (web ✓ da686eb, mobile pending) | — |
