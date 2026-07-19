# Spec: Consistent UI/UX (aspect 1)

## Source of truth
The M3 (Material 3) design system already built in `feat/ui-revamp-v4` — validated: Expo
component library (`frontend/`, tested by m3-components-extended + ui-components suites) and web
M3 components (`web/`, tested by m3-web-components.spec.ts, 30 Playwright tests). Extend it;
never introduce a second component vocabulary.

## Hard rules
1. **One feedback language everywhere.** Every user-facing outcome (success, denial, flag,
   error) renders through the shared severity system: error/warn/success/info, consistent icon +
   color + placement on both clients. A guardrail FLAG is a first-class UI state (amber, named
   discrepancy, action buttons: confirm / edit / reject) — not a toast that vanishes.
2. **Staging is always visible.** Anything an agent staged but you haven't confirmed is visually
   distinct (badge + provenance chip) on every screen where it appears. Committed vs staged can
   never look identical.
3. **Provenance chips are a core UI primitive**: every node rendered anywhere shows its
   provenance level as a compact chip (user_attested / verified / structural / ai_unverified /
   inference). One shared component per platform, used everywhere, no exceptions.
4. Accessibility floor: WCAG AA contrast, ARIA live regions for toasts (polite; assertive only
   for errors), full keyboard nav on web, screen-reader labels on mobile. Critical errors
   persist until dismissed; everything else auto-dismisses.
5. New screens copy an existing screen's layout skeleton from v4 before diverging. Divergence is
   a decision recorded in the task's -decisions file, not a whim.

## Anti-goals
No second design system, no per-screen one-off components, no raw hex colors in screens
(theming spec owns color).
