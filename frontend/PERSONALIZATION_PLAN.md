# Polymath OS — Personalization System Plan

> **STATUS: ARCHIVED — IMPLEMENTED** — This was the personalization plan from March 2026.
> **Implementation status**: All 7 color schemes implemented (`shared/design-tokens.ts`), customize screen built (`/customize`), screen visibility toggles wired, layout preferences stored in Zustand.
> **Superseded by**: `qoder-agent-docs/01_PROJECT_STATUS_ANALYSIS.md` for current status.
> Kept for historical traceability.

## Overview
Full personalization system with color schemes, layouts, and screen preferences.

## Progress Tracker

### Stage 1: Quick Capture Bottom Bar ⬜
- [ ] Transform FloatingPill to single Quick Capture button
- [ ] Remove 3 nav icons, keep centered capture area
- [ ] Commit

### Stage 2: Color Schemes (7 total) ⬜
- [ ] Keep void, nova, amber themes
- [ ] Add ocean (blue), forest (green), sunset (orange/coral), midnight (deep purple)
- [ ] Update theme store
- [ ] Commit

### Stage 3: Layout & Screen Preferences ⬜
- [ ] Add layout options (sidebarPosition, dashboardLayout, profileLayout)
- [ ] Add screen visibility preferences (which tabs/screens to show)
- [ ] Create preferences store slice
- [ ] Commit

### Stage 4: Settings UI ⬜
- [ ] Build Settings/Personalization screen
- [ ] Color scheme picker with live preview
- [ ] Layout toggles
- [ ] Screen visibility toggles
- [ ] Commit

### Stage 5: Documentation ⬜
- [ ] Update FEATURE_AUDIT_AND_ROADMAP.md
- [ ] Update README.md
- [ ] Commit

### Stage 6: Cleanup ⬜
- [ ] Final testing
- [ ] Git tag release

---

## Color Schemes (7 Total)

| Name | Background | Accent | Type |
|------|------------|--------|------|
| Void | #000000 | #FFFFFF | Dark |
| Nova | #FFFFFF | #000000 | Light |
| Amber | #000000 | #FFB800 | Dark |
| Ocean | #0A1628 | #3B82F6 | Dark |
| Forest | #0A1A0A | #10B981 | Dark |
| Sunset | #1A0A0A | #F97316 | Dark |
| Midnight | #0F0A1A | #A855F7 | Dark |

## Layout Options

### Sidebar Position
- `left` (default)
- `right`
- `hidden`

### Dashboard Layout
- `grid` (default) — Bento grid cards
- `list` — Vertical list
- `compact` — Minimal stats only

### Profile Layout
- `full` (default) — Avatar + stats + settings
- `minimal` — Stats + settings only

## Screen Visibility

Users can toggle visibility of:
- Dashboard (required, always on)
- Knowledge
- Mesh
- Journal
- Chat
- Analytics
- Integrations
- Alerts

---

## Commits
- Stage 1: "Quick Capture bottom bar - replace nav icons"
- Stage 2: "7 color schemes - ocean, forest, sunset, midnight"
- Stage 3: "Personalization store - layouts & screen prefs"
- Stage 4: "Settings UI - color, layout, screen pickers"
- Stage 5: "Documentation update"
