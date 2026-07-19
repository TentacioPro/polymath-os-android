# Spec: Theming (aspect 2)

## Source of truth
The v4 theme system: named themes (void, nova, amber, ocean — confirmed via frontend theme
tests) with spacing constants and font-family tokens. Web `appearance/` + `customize/` routes
already exist for user-facing theme control.

## Hard rules
1. **One token source per platform, one contract across platforms.** Semantic token names
   (surface, primary, on-surface, severity.error, provenance.attested…) are identical on web and
   mobile; only the resolved values live per-platform. A component references tokens, never
   literals.
2. **Every theme defines the full token set** — including the severity and provenance-chip
   colors from ui-ux.spec.md. A theme missing a token fails a unit test, not a code review.
3. Theme identity is test-enforced: the existing theme-identity tests (7 currently stale —
   Task 01) are the pattern. When a theme's intent changes, its test changes in the same commit.
   A design change that breaks theme tests without updating them is an incomplete task.
4. Dark/light correctness is per-theme (void=dark, nova=light), verified by the identity tests,
   respected by both clients' system-mode handling.
