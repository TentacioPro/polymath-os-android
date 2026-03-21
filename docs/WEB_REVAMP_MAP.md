# Polymath OS — Web Revamp Map

> **STATUS: ARCHIVED** — Web revamp map from March 6, 2026 (V2/V3 era, brutalist token migration).
> **Superseded by**: `qoder-agent-docs/02_WEB_ROADMAP_CLEAN.md` and `qoder-agent-docs/08_UI_REVAMP_V4_PLAN.md`.
> All 7 themes, shared design token system, and full V4 revamp are now complete.
> Kept for historical traceability.

---

## 1. Design System Alignment

The mobile app defines the source-of-truth design system. The web must match exactly.

### 1.1 Theme System

| Token | Mobile (7 themes) | Web (3 themes → 7) |
|-------|-------------------|---------------------|
| Themes available | Void, Nova, Amber, Ocean, Forest, Sunset, Midnight | ~~Void, Amber, Nova~~ → **All 7** |
| Background | `tokens.background` | CSS var `--poly-bg` |
| Surface | `tokens.surface` | CSS var `--poly-surface` |
| Surface elevated | `tokens.surfaceElevated` | CSS var `--poly-surface-elevated` (NEW) |
| Border | `tokens.border` | CSS var `--poly-border` |
| Border muted | `tokens.borderMuted` | CSS var `--poly-border-muted` |
| Text primary | `tokens.textPrimary` | CSS var `--poly-text` |
| Text secondary | `tokens.textSecondary` | CSS var `--poly-muted` |
| Text muted | `tokens.textMuted` | CSS var `--poly-dim` |
| Accent | `tokens.accent` | CSS var `--poly-accent` |
| Accent contrast | `tokens.accentContrast` | CSS var `--poly-accent-text` |
| Shadow | `tokens.shadow` | CSS var `--poly-shadow` |
| Shadow offset | `{width: 4, height: 4}` | `box-shadow: 4px 4px 0 0` |
| Fonts | SpaceGrotesk / JetBrainsMono | `--font-display` / `--font-mono` |

### 1.2 Typography

| Style | Mobile | Web |
|-------|--------|-----|
| Display | 28px, bold, -0.5 tracking, uppercase | `text-[28px] font-bold tracking-tight uppercase font-display` |
| Heading | 20px, bold, -0.3 tracking, uppercase | `text-xl font-bold tracking-tight uppercase font-display` |
| Body | 14px, 400, 20px line-height | `text-sm leading-5` |
| Caption | 12px, 500, 0.5 tracking | `text-xs font-medium tracking-wide` |
| Mono | 10px, 400, 1.5 tracking, uppercase | `text-[10px] font-mono uppercase tracking-widest` |

### 1.3 Spacing

| Name | Mobile | Web (Tailwind) |
|------|--------|----------------|
| xs | 4px | `1` (0.25rem) |
| sm | 8px | `2` (0.5rem) |
| md | 12px | `3` (0.75rem) |
| lg | 16px | `4` (1rem) |
| xl | 20px | `5` (1.25rem) |
| xxl | 24px | `6` (1.5rem) |
| xxxl | 32px | `8` (2rem) |

### 1.4 Radii

| Name | Mobile | Web |
|------|--------|-----|
| none | 0 | 0 (brutalist default via `* { border-radius: 0 !important }`) |
| sm | 4px | NOT USED (brutalist) |
| md | 8px | NOT USED (brutalist) |
| pill | 999px | For specific pill shapes only |

### 1.5 Shadows (Brutalist Architect)

| Type | Mobile | Web |
|------|--------|-----|
| Standard | `shadowOffset: {4,4}, shadowOpacity: 1, shadowRadius: 0` | `box-shadow: 4px 4px 0 0 rgba(var(--poly-shadow), 1)` |
| Small | `{2,2}` offset | `box-shadow: 2px 2px 0 0 rgba(var(--poly-shadow), 1)` |
| Large | `{8,8}` offset | `box-shadow: 8px 8px 0 0 rgba(var(--poly-shadow), 1)` |
| Subtle | opacity 0.2 | `box-shadow: 4px 4px 0 0 rgba(var(--poly-shadow), 0.2)` |

### 1.6 Navigation Patterns

| Pattern | Mobile | Web (Mobile <768px) | Web (Desktop 768px+) |
|---------|--------|---------------------|----------------------|
| Bottom nav | Floating pill (Quick Capture) | Floating pill nav (4 items + action) | Hidden |
| Side nav | Slide-in drawer | Slide-in drawer | Persistent sidebar |
| Top bar | — | Fixed top header + hamburger | — (sidebar visible) |
| Drawer style | Dark (#0A0A0A), rounded nav items, theme toggle | Match mobile drawer style | — |
| Active indicator | Accent color icon/text | Accent left border + bg tint | Accent left border + bg tint |

---

## 2. Missing Pages to Add

| # | Page | Route | Mobile Reference | API Endpoints |
|---|------|-------|-----------------|---------------|
| 1 | Search | `/search` | `search.tsx` | `GET /api/search?q=` |
| 2 | Activity Detail | `/activities/[id]` | `activity-detail.tsx` | `GET /api/activities/{id}` |
| 3 | Analytics | `/analytics` | `analytics.tsx` | `GET /api/stats`, `GET /api/agent/stats`, `GET /api/health` |
| 4 | Alerts | `/alerts` | `alerts.tsx` | `GET /api/notifications` |
| 5 | Profile | `/profile` | `profile.tsx` | `GET /api/agent/persona`, `GET /api/stats` |
| 6 | Appearance | `/appearance` | `appearance.tsx` | Client-side (7 theme previews) |
| 7 | Customize | `/customize` | `customize.tsx` | Client-side (layout + visibility prefs) |
| 8 | Integrations | `/integrations` | `integrations.tsx` | `GET/POST /api/ai-config`, `GET /api/health` |

---

## 3. Existing Page Updates

| Page | What Needs Changing |
|------|---------------------|
| Dashboard | Add recent journals section, remove cosmetic "LIVE" (wire to `/api/health`) |
| Activities | Add click → detail page navigation, keep file upload |
| Journal | Add edit modal (API exists, just needs UI) |
| Connections | Already fine — matching mobile |
| Agent | Already fine — exceeds mobile |
| Chat | Already fine — exceeds mobile |
| Export | Already fine — matching mobile |

---

## 4. Component Updates

| Component | What Needs Changing |
|-----------|---------------------|
| `TopHeader` | Wire "LIVE" indicator to `GET /api/health`, add `/chat` to page titles |
| `BottomNav` | Add Search action, consider Quick Capture modal |
| `AppSidebar` | Add nav links for new pages (Search, Analytics, Alerts, Profile), add all 7 themes |
| `Drawer` | Add nav links for new pages, match mobile drawer style (dark bg, rounded items, tools section) |
| `ThemeProvider` | Support 7 theme IDs |

---

## 5. Implementation Order

### Sprint 1: Design Foundation (This PR)
1. ✅ Add 4 missing themes to CSS (Ocean, Forest, Sunset, Midnight)
2. ✅ Update theme registry (`lib/theme.ts`) to include all 7
3. ✅ Update ThemeProvider to handle 7 theme classes
4. ✅ Update navigation components (Sidebar, Drawer, BottomNav) — add all routes, match mobile styling
5. ✅ Update TopHeader — wire LIVE to health, add missing page titles

### Sprint 2: Missing Pages
6. Add Search page
7. Add Activity Detail page
8. Add Analytics page
9. Add Alerts page
10. Add Profile page
11. Add Appearance page
12. Add Customize page
13. Add Integrations/AI Config page
14. Add Journal edit functionality

### Sprint 3: Polish
15. Quick Capture modal for web
16. Skeleton loading states
17. Toast/feedback system
18. Error boundaries per page

---

## 6. Design Principles (Shared Across Platforms)

1. **Brutalist Architect** — sharp edges (border-radius: 0), offset shadows, monospace labels
2. **Dark-first** — 6 of 7 themes are dark, drawers/nav always dark
3. **White-on-black text** — high contrast, no gray-on-gray
4. **Uppercase mono labels** — section headers, category badges, status indicators
5. **Material Symbols** — filled weight, consistent icon set
6. **Theme-aware accents** — borders, shadows, active states all use `accent` color
7. **Minimal chrome** — no gradients, no glass effects, no rounded corners
8. **Content-first** — data immediately visible, no empty states without context
