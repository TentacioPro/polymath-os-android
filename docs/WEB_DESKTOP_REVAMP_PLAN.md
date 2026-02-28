# Polymath OS — Web Desktop/Tablet Revamp Plan

> **Problem:** Current web app is a mobile-wrapper — 672px max-width, single-column, bottom-sheet modals, bottom nav bar. On a 1920px screen, ~60% is empty.  
> **Goal:** Make the web app feel desktop/tablet-native while keeping the brutalist design language and 3-theme color system intact.  
> **Scope:** Layout shell, navigation, all 6 pages, modals. Colors/themes are **NOT** changing.  
> **Date:** 2026-02-28

---

## 1. What's Wrong (Audit)

| Problem | Current | Impact |
|---------|---------|--------|
| Content width | `max-w-2xl` (672px) | 60% empty on desktop |
| Responsive breakpoints | **Zero** — no `md:`, `lg:`, `xl:` | Identical on phone and 4K monitor |
| Navigation | Floating bottom pill bar | Mobile-only pattern, wastes desktop space |
| TopHeader | Thin bar with hamburger + page title | Doesn't use horizontal space |
| Drawer | Overlay slide-in (85% width) | Mobile pattern, desktop should have persistent sidebar |
| Modals | `items-end` bottom-sheets, `max-w-lg` | Should be centered dialogs on desktop |
| Page grids | Single-column everywhere | Desktop should be multi-column |
| Cards | `-mt-px` stacked list | No side-by-side on wide screens |

---

## 2. Architecture Decision: Responsive Shell

The app should adapt across 3 breakpoints:

| Breakpoint | Width | Navigation | Content |
|------------|-------|------------|---------|
| **Mobile** (`< md`) | < 768px | Bottom nav + hamburger drawer | Single column, bottom-sheet modals |
| **Tablet** (`md` to `lg`) | 768–1023px | Collapsed icon sidebar (64px) | 2-column grids, centered modals |
| **Desktop** (`lg+`) | ≥ 1024px | Expanded sidebar (240px) | Multi-column grids, centered modals |
| **Wide** (`xl+`) | ≥ 1280px | Expanded sidebar (240px) | Wider content, 3-4 col grids |

### 2.1 Layout Shell Change

**Current:**
```
TopHeader (fixed top, 60px)
  └─ max-w-2xl centered
main (max-w-2xl, pt-60, pb-100)
BottomNav (fixed bottom, 360px wide pill)
Drawer (overlay, triggered by hamburger)
```

**New:**
```
┌──────────────────────────────────────────────┐
│  Sidebar (hidden < md, icon-only md-lg,      │  main content area
│   expanded lg+) — persistent, not overlay    │  (fluid width, max-w-7xl)
│                                              │
│  ┌────────┬──────────────────────────────┐   │
│  │ 240px  │  TopBar + page content       │   │
│  │ sidebar│  (multi-column grids)        │   │
│  │        │                              │   │
│  └────────┴──────────────────────────────┘   │
│                                              │
│  BottomNav (visible < md only)               │
└──────────────────────────────────────────────┘
```

---

## 3. Component Changes

### 3.1 Layout (`layout.tsx`)

- Remove `max-w-2xl mx-auto` from `<main>`
- Add responsive wrapper: sidebar + content area
- Content area: `flex-1 min-w-0 max-w-7xl mx-auto px-6 lg:px-10`
- Padding: `pt-0 lg:pt-6` (no fixed header on desktop), `pb-[100px] md:pb-6`
- Sidebar is a **new persistent component**, not the current overlay Drawer

### 3.2 Sidebar (`AppSidebar.tsx`) — NEW

A persistent sidebar replacing both BottomNav (on desktop) and Drawer:

- **< md**: Hidden (BottomNav shown instead)
- **md – lg**: Icon-only rail (64px wide), tooltips on hover
- **lg+**: Expanded with labels (240px wide)
- Contains: logo/branding, nav links, quick actions, theme switcher, collapse toggle
- Fixed left, full height, `border-r border-poly-border`
- Active link: `border-l-2 border-poly-accent` + accent bg tint
- Design: Same brutalist aesthetic — sharp edges, mono uppercase labels

### 3.3 TopHeader → TopBar

- **< md**: Keep current mobile header (hamburger + title + LIVE indicator)
- **md+**: Remove hamburger (sidebar visible), show breadcrumb-style path, add search bar and notification area
- Full width of content area (not max-w-2xl)

### 3.4 BottomNav

- **< md**: Keep as-is (floating pill bar)
- **md+**: `hidden md:hidden` — completely hidden when sidebar is visible

### 3.5 Drawer

- **< md**: Keep as mobile overlay (hamburger trigger)
- **md+**: Not needed — sidebar is persistent. Remove overlay behavior.

### 3.6 Modals — Responsive Pattern

All modals currently use `items-end` (bottom-sheet). Change to:

```
< md:  items-end justify-center     → bottom-sheet (keep)
md+:   items-center justify-center  → centered dialog
```

- Mobile: `w-full max-w-lg border-t` (current bottom-sheet)
- Desktop: `w-full max-w-xl border border-poly-border architect-shadow-lg` (centered card)

---

## 4. Page-by-Page Layout Changes

### 4.1 Dashboard (`/`)

**Current:** 3-col stat grid + single-col topic + stacked cards  
**New:**

| Breakpoint | Layout |
|------------|--------|
| Mobile | Current (3-col stats, stacked cards) |
| md | 2-col: stats row spans full, topics + recent side by side |
| lg | 3-col bento: stats in top row, topics left, recent middle, system right |
| xl | 4-col dashboard grid with stat cards filling top row |

Key classes: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6`

### 4.2 Activities (`/activities`)

**Current:** Stacked single-column card list  
**New:**

| Breakpoint | Layout |
|------------|--------|
| Mobile | Stacked list (current) |
| md | 2-column card grid |
| lg+ | 3-column card grid with fixed-position action bar on right |

- Activity cards become uniform-height grid items
- "Add Activity" modal → centered dialog on desktop
- Drag-drop zone spans full width

### 4.3 Journal (`/journal`)

**Current:** Stacked single-column journal entries  
**New:**

| Breakpoint | Layout |
|------------|--------|
| Mobile | Stacked list |
| md | 2-column masonry-style grid |
| lg+ | 3-column grid, potential detail panel on right (master-detail) |

- New journal modal → centered dialog on desktop
- Tags/filters row can expand horizontally

### 4.4 Connections / Neural Mesh (`/connections`)

**Current:** Tab bar + single-column views  
**New:**

| Breakpoint | Layout |
|------------|--------|
| Mobile | Current (tabs + stacked) |
| md | Tabs stay, content becomes 2-col grid |
| lg+ | Graph visualization could expand wide, suggestion cards in 2-3 columns |

- Timeline view benefits from full width
- Graph cards in `grid-cols-2 lg:grid-cols-3`
- Suggestion cards in `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### 4.5 Agent (`/agent`)

**Current:** 3 tabs (memories/persona/learning) + 2 modals, all single column  
**New:**

| Breakpoint | Layout |
|------------|--------|
| Mobile | Current (tabs + stacked) |
| md | Stats row full width, memory cards 2-col |
| lg+ | Sidebar-style tab navigation (vertical tabs on left, content on right) instead of horizontal tabs. Memory cards 2-3 col grid |

- Persona view: form fields in 2-col grid on desktop
- Chat modal → centered dialog, wider (max-w-2xl on desktop)
- Edit persona modal → centered dialog

### 4.6 Export (`/export`)

**Current:** Stacked export buttons + restore section  
**New:**

| Breakpoint | Layout |
|------------|--------|
| Mobile | Current (stacked) |
| md+ | Export cards in horizontal row (3 side by side), restore section below |
| lg+ | Export cards + restore card in a 2-row grid, info box alongside |

- Import modal → centered dialog on desktop

---

## 5. Implementation Order

### Phase 1: Shell & Navigation (highest impact)
1. Create `AppSidebar.tsx` — persistent sidebar with responsive collapse
2. Update `layout.tsx` — responsive shell (sidebar + content area), remove `max-w-2xl`
3. Update `TopHeader.tsx` → responsive top bar (breadcrumbs on desktop, hamburger on mobile)
4. Update `BottomNav.tsx` — hide on `md+`
5. Update `Drawer.tsx` — mobile-only, hidden on `md+`

### Phase 2: Modal System
6. Create responsive modal wrapper component (`ResponsiveModal.tsx`)
   - Bottom-sheet on mobile, centered dialog on desktop
   - Reusable across all pages

### Phase 3: Page Layouts
7. Dashboard — multi-column bento grid
8. Activities — card grid + responsive modal
9. Journal — card grid + responsive modal
10. Connections — multi-column content areas
11. Agent — vertical tabs on desktop, card grids, responsive modals
12. Export — horizontal card row, responsive modal

### Phase 4: Polish
13. Hover states, transitions, focus rings for desktop
14. Keyboard navigation improvements
15. Wider content utilization (data tables, expanded visualizations)

---

## 6. Key CSS Utilities to Add

```css
/* Responsive container in globals.css */
.content-area {
  @apply w-full max-w-7xl mx-auto px-5 md:px-6 lg:px-10;
}

/* Responsive grid helpers */
.grid-adaptive {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6;
}

/* Modal responsive positioning */
.modal-overlay {
  @apply fixed inset-0 bg-[var(--poly-overlay)] backdrop-blur-sm flex z-50;
  @apply items-end md:items-center justify-center;
}

.modal-panel {
  @apply bg-poly-bg w-full border-poly-border;
  @apply border-t md:border max-w-lg md:max-w-xl lg:max-w-2xl;
  @apply md:architect-shadow-lg;
}
```

---

## 7. Files to Create / Modify

| File | Action | Description |
|------|--------|-------------|
| `components/AppSidebar.tsx` | **CREATE** | Persistent responsive sidebar |
| `components/ResponsiveModal.tsx` | **CREATE** | Bottom-sheet (mobile) / centered dialog (desktop) |
| `app/layout.tsx` | **MODIFY** | Responsive shell with sidebar + content |
| `app/globals.css` | **MODIFY** | Add responsive utilities, sidebar transitions |
| `components/TopHeader.tsx` | **MODIFY** | Responsive — breadcrumbs on desktop |
| `components/BottomNav.tsx` | **MODIFY** | Add `md:hidden` |
| `components/Drawer.tsx` | **MODIFY** | Add `md:hidden` wrapper |
| `app/page.tsx` | **MODIFY** | Multi-column bento grid |
| `app/activities/page.tsx` | **MODIFY** | Card grid + responsive modal |
| `app/journal/page.tsx` | **MODIFY** | Card grid + responsive modal |
| `app/connections/page.tsx` | **MODIFY** | Multi-column content |
| `app/agent/page.tsx` | **MODIFY** | Vertical tabs + card grid + responsive modals |
| `app/export/page.tsx` | **MODIFY** | Horizontal card row + responsive modal |

---

## 8. What's NOT Changing

- ✅ Theme system (3 themes, CSS variables, ThemeProvider)
- ✅ Color tokens (`--poly-*` variables)
- ✅ Fonts (Space Grotesk / Inter / JetBrains Mono)
- ✅ Material Symbols icons
- ✅ Brutalist sharp-edge aesthetic (0px border-radius)
- ✅ Blueprint grid background
- ✅ Architect offset shadows
- ✅ Mono uppercase label pattern
- ✅ Data layer (hooks, API, types)

---

## 9. Success Criteria

- [ ] Sidebar visible on `md+`, bottom nav on mobile only
- [ ] Content fills available screen width (up to `max-w-7xl`)
- [ ] All grids adapt: 1 col → 2 col → 3+ col across breakpoints
- [ ] Modals centered on desktop, bottom-sheet on mobile
- [ ] No horizontal scroll at any breakpoint
- [ ] Desktop feels like a native dashboard app, not a phone emulator
- [ ] Theme switcher accessible from sidebar on desktop
- [ ] All 3 themes render correctly at all breakpoints
