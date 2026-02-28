# Polymath OS — Mobile UI Revamp Plan

> **Source of truth:** Google Stitch designs (`design/GOOGLE STITCH/`)  
> **Target:** Expo/React Native mobile app (`frontend/`)  
> **Date:** 2026-02-28

---

## 1. Executive Summary

The current mobile app has no theme system — colors are hardcoded across 7 monolithic screen files, uses a default 6-tab bottom bar (Ionicons), and has no drawer/sidebar. The Google Stitch designs define 3 distinct themes and a brutalist UI system with a floating pill nav, a drawer navigator, and screen-level bottom actions.

This plan standardizes the design across all 3 themes, resolves the 6 bottom-nav inconsistencies found in the Stitch files, and defines the implementation sequence.

---

## 2. Three Themes — Resolved Token System

The Stitch designs contain three theme folders. Below is the **canonical token set** for each, resolving inconsistencies found across the 20 screens.

### 2.1 VOID (Black Theme) — Default

| Token | Value | Notes |
|-------|-------|-------|
| `background` | `#000000` | Pure black |
| `surface` | `#111111` | Cards, elevated surfaces |
| `surfaceElevated` | `#1A1A1A` | Modal backgrounds, popovers |
| `border` | `#FFFFFF` | Full-contrast borders (Stitch canonical) |
| `borderMuted` | `#333333` | Subtle separators |
| `textPrimary` | `#FFFFFF` | Body text, headings |
| `textSecondary` | `#A3A3A3` | **Standardized** (was 6 different values) |
| `textMuted` | `#666666` | Placeholders, timestamps |
| `accent` | `#FFFFFF` | Active states, CTAs |
| `accentContrast` | `#000000` | Text on accent surfaces |
| `shadow` | `rgba(255,255,255,1)` | Architect shadow (brutalist offset) |
| `shadowMuted` | `rgba(255,255,255,0.05)` | Subtle glow |
| `gridLine` | `#1A1A1A` | Blueprint/grid background pattern |
| `gridSpacing` | `20px` | Grid size |
| `fontDisplay` | `Space Grotesk` | **Standardized** (prd_4's Archivo Narrow overridden) |
| `fontMono` | `monospace` | Labels, metadata |

### 2.2 NOVA (Light Theme)

| Token | Value | Notes |
|-------|-------|-------|
| `background` | `#FFFFFF` | Pure white |
| `surface` | `#F8FAFC` | Cards (Tailwind slate-50) |
| `surfaceElevated` | `#F1F5F9` | Modals (slate-100) |
| `border` | `#000000` | Full-contrast borders |
| `borderMuted` | `#E2E8F0` | Subtle separators (slate-200) |
| `textPrimary` | `#000000` | Body text |
| `textSecondary` | `#475569` | Muted text (slate-600) |
| `textMuted` | `#94A3B8` | Placeholders (slate-400) |
| `accent` | `#000000` | Active states, CTAs |
| `accentContrast` | `#FFFFFF` | Text on accent surfaces |
| `shadow` | `rgba(0,0,0,1)` | Architect shadow |
| `shadowMuted` | `rgba(0,0,0,0.05)` | Subtle shadow |
| `gridLine` | `#F1F5F9` | Light blueprint pattern |
| `gridSpacing` | `20px` | Grid size |
| `fontDisplay` | `Space Grotesk` | Same across themes |
| `fontMono` | `monospace` | Same across themes |

### 2.3 AMBER VOID (Accent Theme)

| Token | Value | Notes |
|-------|-------|-------|
| `background` | `#000000` | Pure black (same as Void) |
| `surface` | `#1A1000` | Warm dark surface |
| `surfaceElevated` | `#331A00` | Amber-tinted elevation |
| `border` | `#FF8C00` | Amber borders |
| `borderMuted` | `#4D2600` | Subtle amber separator |
| `textPrimary` | `#FFFFFF` | Body text |
| `textSecondary` | `#FFB800` | Amber secondary text |
| `textMuted` | `#996600` | Dimmed amber |
| `accent` | `#FFB800` | Amber primary accent |
| `accentContrast` | `#000000` | Text on amber surfaces |
| `shadow` | `rgba(255,140,0,0.6)` | Amber glow shadow |
| `shadowMuted` | `rgba(255,184,0,0.1)` | Subtle amber glow |
| `gridLine` | `#331A00` | Amber grid pattern |
| `gridSpacing` | `20px` | Grid size |
| `fontDisplay` | `Space Grotesk` | Same across themes |
| `fontMono` | `monospace` | Same across themes |

---

## 3. Design Inconsistencies — Resolution Decisions

### 3.1 Bottom Navigation Bar (6 patterns found → 1 canonical)

**Problem:** The Stitch designs contain 6 different bottom nav patterns:

| Pattern | Used In | Description |
|---------|---------|-------------|
| A. Floating pill 3+1 (black) | prd_4/6/7/9/12/18 | 3 nav icons + action button |
| B. Full-width 5-icon | prd_1 | Labels + center FAB |
| C. Full-width 4-icon | prd_11 | Raised search square |
| D. Labeled sub-nav pill | prd_8 | Agents/Chat/Config dividers |
| E. White floating pill | prd_13 | Same shape, inverted colors |
| F. No nav (chat input/CTA) | prd_2/3/5/10/15/16/17/19 | Screen-specific bottom actions |

**Resolution — Canonical bottom nav:**

> **Use Pattern A (Floating Pill 3+1)** as the global navigation, with theme-appropriate colors.

- **Void:** Black pill, white border, white architect shadow
- **Nova:** Black pill, black border, black architect shadow *(per Nova screen 1 — nav stays black even on white pages)*
- **Amber Void:** Black pill, amber border, amber glow shadow

**Standardized icons (3 nav + 1 action):**

| Position | Icon | Target | Notes |
|----------|------|--------|-------|
| 1 | `dashboard` | Dashboard / Home | Always present |
| 2 | `hub` | Neural Mesh / Knowledge | Core feature |
| 3 | `person` | Profile / Settings | **Standardized** (was `memory` in some screens) |
| 4 (action) | `add` | Quick Capture sheet | **Standardized** (was `logout`/`close` contextually) |

**Active state:** White dot indicator below icon (from prd_4 — cleanest pattern).

**Chat / detail screens:** The floating pill stays visible; screen-specific actions (chat input, CTAs) sit **above** the pill with appropriate spacing.

### 3.2 Screen 13 White Nav on Black Page

**Problem:** Analytics screen (prd_13) has a white `bg-white text-black` nav pill on a `#000000` page background.

**Resolution:** This is a **design error.** The nav pill should follow the theme system:
- In Void theme → black pill (matches all other Void screens)
- In Nova theme → black pill (matches Nova screen 1)
- The white nav creates a jarring contrast that breaks visual consistency

### 3.3 Light Screens in Black Theme Folder (prd_2, 3, 15)

**Problem:** Three screens in the "Black Theme" folder use `--bg-color: #FFFFFF` — they're actually Nova/light theme screens.

**Resolution:** These screens (Chat interfaces, Capture overlay) should use the **active theme's** tokens, not a fixed light palette. They were likely designed separately and placed in the wrong folder. In implementation:
- Chat interface → uses `background` + `surface` from current theme
- Capture overlay → black sheet on dimmed background (already correct in design)

### 3.4 Drawer Theme Alignment

**Problem:** The drawer (prd_14) has `bg-black border-r border-white` with all-white text. If used in Nova theme, the drawer would need different colors. If used in Amber Void, borders/accents should be amber.

**Resolution:** The drawer should be **theme-aware but always dark-dominant:**

| Drawer Element | Void | Nova | Amber Void |
|----------------|------|------|------------|
| Background | `#000000` | `#000000` *(stays dark)* | `#000000` |
| Border | `#FFFFFF` | `#000000` | `#FF8C00` |
| Text primary | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` |
| Text secondary | `#A3A3A3` | `#9CA3AF` | `#FFB800` |
| Active thread | `bg-neutral-900 border-l-white` | `bg-neutral-900 border-l-white` | `bg-neutral-900 border-l-amber` |
| Swap Theme card | White border | White border | Amber border |
| Overlay backdrop | `bg-black/70` | `bg-black/70` | `bg-black/70` |

> The drawer is a "system surface" — always black regardless of page theme. Only accents change per theme.

### 3.5 `--text-secondary` Inconsistency

**Problem:** 6 different values found: `#A3A3A3`, `#AAAAAA`, `#CCCCCC`, `#D4D4D4`, `#9CA3AF`, `#475569`

**Resolution:** Standardize to one value per theme (see Section 2 above).

### 3.6 Font Inconsistency

**Problem:** prd_4 uses `Archivo Narrow` while all others use `Space Grotesk`.

**Resolution:** Use `Space Grotesk` everywhere. `Archivo Narrow` was a one-off design experiment.

---

## 4. Screen Map — Stitch Design → Mobile App

| Stitch Screen | Mobile App Route | Mapping |
|---------------|-----------------|---------|
| prd_6 — Dashboard | `/(tabs)/index` | Bento stats + ingestion log |
| prd_4 — Activities Hub | `/(tabs)/activities` | Activity list + upload |
| prd_7 — Knowledge Sources | `/(tabs)/knowledge` | File gallery (NEW — replaces journal) |
| prd_1 — Neural Mesh Detail | `/(tabs)/mesh` | Connection graph detail |
| prd_8 — Agent Panel | `/(tabs)/agent` | Agent configuration |
| prd_5/15 — Neural Chat | `/chat` | Full-screen chat (NOT a tab) |
| prd_3 — Quick Capture | Modal overlay | Triggered by `+` FAB |
| prd_9 — Profile/Settings | `/profile` | Drawer-linked screen |
| prd_13 — Analytics | `/analytics` | Drawer-linked screen |
| prd_14 — Drawer | Drawer navigator | Global side navigation |
| prd_12 — Integrations | `/integrations` | Drawer-linked screen |
| prd_18 — Alerts | `/alerts` | Notification center |
| prd_19 — Content Detail | `/content/[id]` | Article reader |
| prd_20 — Mesh Map | Embedded in mesh tab | Interactive graph view |
| prd_10 — Ingestion Analysis | `/ingestion/[id]` | Detail screen |
| prd_16 — Response/Export | `/export` | Document export view |
| prd_17 — AI Memory Log | `/memory-log` | Debug/diagnostics |
| prd_11 — Navigation Hub | Replaced by drawer | CMD+K search → search bar in drawer |

---

## 5. Navigation Architecture — Revamped

### Current (6 bottom tabs, no drawer):
```
Stack
  └── Tabs (6)
       ├── Dashboard
       ├── Activities
       ├── Journal
       ├── Connections
       ├── Export
       └── Agent
```

### Proposed (3+1 floating pill + drawer):
```
Drawer Navigator
  └── Stack
       ├── Tabs (3 in floating pill)
       │    ├── index (Dashboard — prd_6)
       │    ├── knowledge (Knowledge Sources — prd_7)
       │    └── mesh (Neural Mesh — prd_1/20)
       │
       ├── chat (Neural Chat — prd_5/15, full-screen)
       ├── agent (Agent Panel — prd_8, full-screen)
       ├── profile (Profile/Settings — prd_9)
       ├── analytics (Analytics — prd_13)
       ├── integrations (Integrations — prd_12)
       ├── alerts (Alerts — prd_18)
       ├── content/[id] (Content Detail — prd_19)
       ├── ingestion/[id] (Ingestion Analysis — prd_10)
       ├── export (Export View — prd_16)
       └── memory-log (AI Memory Log — prd_17)
       
FAB (+) → Quick Capture Modal (prd_3)
```

**Key changes:**
- **6 tabs → 3 tabs** (Dashboard, Knowledge, Mesh) — core browsing screens
- **Drawer** houses secondary navigation (Profile, Analytics, Integrations, etc.)
- **Chat** is a full-screen experience with its own input bar (no bottom pill overlap)
- **FAB (+)** button in the floating pill opens Quick Capture overlay
- **Agent** is accessed from Drawer or floating pill sub-nav (context-dependent)

---

## 6. Implementation Plan — Phased Approach

### Phase 1: Theme Foundation (Week 1)
Create the centralized theme system before touching any screens.

| Task | Details |
|------|---------|
| **1.1** Create `frontend/theme/tokens.ts` | All 3 theme token objects (Void/Nova/Amber) |
| **1.2** Create `frontend/theme/ThemeContext.tsx` | React Context + `useTheme()` hook |
| **1.3** Create `frontend/theme/index.ts` | Re-exports + `createThemedStyles()` helper |
| **1.4** Persist theme in Zustand store | Add `theme` field to `useStore.ts` with AsyncStorage |
| **1.5** Load Space Grotesk font | Add to `app/_layout.tsx` via `expo-font` |
| **1.6** Create grid background component | `<GridBackground />` with theme-aware pattern |

### Phase 2: Core Components (Week 1-2)
Extract reusable components from the Stitch design system.

| Task | Details |
|------|---------|
| **2.1** `<FloatingPill />` | 3 nav icons + action button, theme-aware |
| **2.2** `<AppDrawer />` | Drawer content (history, quick actions, theme swap) |
| **2.3** `<BentoCard />` | Brutalist card with architect shadow |
| **2.4** `<ArchitectButton />` | CTA button with offset shadow |
| **2.5** `<QuickCapture />` | Bottom sheet modal (prd_3) |
| **2.6** `<ChatInput />` | Chat text input bar with attachments |
| **2.7** `<SectionHeader />` | Mono uppercase label with optional icon |
| **2.8** `<Badge />` | Status/type badges (white/amber variants) |
| **2.9** `<StatCard />` | Bento stat cell (value + label + icon) |

### Phase 3: Navigation Restructure (Week 2)
Rebuild the navigation tree.

| Task | Details |
|------|---------|
| **3.1** Install `@react-navigation/drawer` | Drawer navigator dependency |
| **3.2** Restructure `app/` routes | New file-based routing per Section 5 |
| **3.3** Replace default tab bar | Custom `<FloatingPill />` as `tabBar` prop |
| **3.4** Integrate drawer | `<AppDrawer />` as drawer content |
| **3.5** Wire FAB to Quick Capture | `+` button opens `<QuickCapture />` modal |

### Phase 4: Screen Redesign (Week 2-3)
Rebuild each screen using themed components.

| Priority | Screen | Source Design |
|----------|--------|---------------|
| P0 | Dashboard | prd_6 (Bento stats) |
| P0 | Knowledge Sources | prd_7 (File gallery) |
| P0 | Neural Mesh | prd_1/20 (Graph + detail) |
| P1 | Chat | prd_5 (Dark chat) |
| P1 | Agent Panel | prd_8 (Persona selector) |
| P1 | Profile/Settings | prd_9 (Toggle themes here) |
| P2 | Analytics | prd_13 (Charts + insights) |
| P2 | Alerts | prd_18 (Notifications) |
| P2 | Integrations | prd_12 (Service toggles) |
| P3 | Content Detail | prd_19 (Article reader) |
| P3 | Ingestion Analysis | prd_10 (Source detail) |
| P3 | Export | prd_16 (Response viewer) |
| P3 | Memory Log | prd_17 (Terminal diagnostics) |

### Phase 5: Polish (Week 3)
| Task | Details |
|------|---------|
| **5.1** Transitions & animations | `react-native-reanimated` for nav, drawer, cards |
| **5.2** Haptic feedback | `expo-haptics` on FAB, nav, swipe |
| **5.3** Theme swap animation | Crossfade or morph between themes |
| **5.4** Responsive layout | Tablet/landscape adaptations |
| **5.5** Accessibility | Screen reader labels, contrast ratios |

---

## 7. File Structure — Proposed

```
frontend/
├── app/
│   ├── _layout.tsx              ← Root: Theme + Drawer + Font loading
│   ├── index.tsx                ← Redirect to /(tabs)
│   │
│   ├── (tabs)/
│   │   ├── _layout.tsx          ← 3-tab layout with <FloatingPill />
│   │   ├── index.tsx            ← Dashboard (prd_6)
│   │   ├── knowledge.tsx        ← Knowledge Sources (prd_7)
│   │   └── mesh.tsx             ← Neural Mesh (prd_1/20)
│   │
│   ├── chat.tsx                 ← Neural Chat (prd_5)
│   ├── agent.tsx                ← Agent Panel (prd_8)
│   ├── profile.tsx              ← Profile/Settings (prd_9)
│   ├── analytics.tsx            ← Analytics (prd_13)
│   ├── integrations.tsx         ← Integrations (prd_12)
│   ├── alerts.tsx               ← Alerts (prd_18)
│   ├── content/[id].tsx         ← Content Detail (prd_19)
│   ├── ingestion/[id].tsx       ← Ingestion Analysis (prd_10)
│   ├── export.tsx               ← Export View (prd_16)
│   └── memory-log.tsx           ← Memory Log (prd_17)
│
├── components/
│   ├── navigation/
│   │   ├── FloatingPill.tsx     ← Custom bottom nav bar
│   │   ├── AppDrawer.tsx        ← Drawer content
│   │   └── QuickCapture.tsx     ← FAB capture modal
│   │
│   ├── ui/
│   │   ├── BentoCard.tsx        ← Card with architect shadow
│   │   ├── ArchitectButton.tsx  ← CTA button
│   │   ├── Badge.tsx            ← Status badges
│   │   ├── StatCard.tsx         ← Dashboard stat cell
│   │   ├── SectionHeader.tsx    ← Mono uppercase header
│   │   ├── ChatInput.tsx        ← Chat input bar
│   │   └── GridBackground.tsx   ← Themed grid pattern
│   │
│   └── shared/
│       ├── SafeView.tsx         ← Safe area + theme background
│       └── ThemedText.tsx       ← Text with theme tokens
│
├── theme/
│   ├── tokens.ts                ← Theme color/spacing/typography tokens
│   ├── ThemeContext.tsx          ← React Context + useTheme hook
│   ├── createStyles.ts          ← createThemedStyles() helper
│   └── index.ts                 ← Re-exports
│
├── store/
│   └── useStore.ts              ← Zustand + theme persistence
│
└── assets/
    └── fonts/
        └── SpaceGrotesk-*.ttf   ← Display font
```

---

## 8. Key Design Decisions Summary

| Decision | Rationale |
|----------|-----------|
| Floating pill stays **black** in all themes | Nova design shows black nav on white page — it's a system control, not part of content |
| Drawer is always **dark** | Acts as a system surface, like iOS Control Center |
| 3 tabs, not 5 or 6 | Mobile best practice; secondary screens via drawer/stack |
| `person` icon, not `memory` | Profile/Settings is the standard 3rd tab in mobile UX |
| `add` FAB is always `add` | Contextual actions (logout, close) belong in screen headers, not global nav |
| Chat is full-screen, not a tab | Chat needs full keyboard real estate; nav pill hides during typing |
| Space Grotesk everywhere | Single display font reduces cognitive load |
| `textSecondary: #A3A3A3` (Void) | Middle ground across the 6 variants found in designs |

---

## 9. Migration Checklist

- [ ] Back up current screens before refactor
- [ ] Create theme system (Phase 1)
- [ ] Extract shared components (Phase 2)
- [ ] Restructure routes (Phase 3)
- [ ] Migrate Dashboard screen first (validate theme system end-to-end)
- [ ] Migrate remaining P0 screens
- [ ] Test theme switching (Void ↔ Nova ↔ Amber)
- [ ] Remove all hardcoded color values from screen files
- [ ] Delete deprecated screen files (old journal, connections, export tabs)
- [ ] Update Zustand store with theme persistence
- [ ] Performance test with 3 themes loaded
- [ ] Accessibility audit per theme
