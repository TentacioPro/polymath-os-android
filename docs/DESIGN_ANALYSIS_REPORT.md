# Polymath OS — Comprehensive Design Analysis Report

> Generated from Google Stitch HTML designs across 3 themes: **Black Theme** (20 screens), **Amber Void** (1 screen), **Nova** (12 screens).

---

## Table of Contents

1. [Screen Inventory & Purpose Mapping](#1-screen-inventory--purpose-mapping)
2. [Color Palettes & CSS Custom Properties](#2-color-palettes--css-custom-properties)
3. [Bottom Navigation Bar Analysis](#3-bottom-navigation-bar-analysis)
4. [Drawer / Sidebar Design](#4-drawer--sidebar-design)
5. [Key UI Components & Patterns](#5-key-ui-components--patterns)
6. [Typography System](#6-typography-system)
7. [Icon System](#7-icon-system)
8. [Spacing, Sizing & Layout](#8-spacing-sizing--layout)
9. [Inconsistencies & Anomalies](#9-inconsistencies--anomalies)
10. [Theming System Recommendations](#10-theming-system-recommendations)

---

## 1. Screen Inventory & Purpose Mapping

### Black Theme (20 Screens — Complete)

| # | Title | Purpose | Type | Has Bottom Nav |
|---|-------|---------|------|----------------|
| 1 | Neural Mesh Detail | Interactive knowledge graph node view with connections | Feature | Yes (5-icon full-width) |
| 2 | Neural Chat (Light) | AI chat interface — light mode variant | Feature | No (chat input only) |
| 3 | Capture Overlay (Light) | Quick capture bottom sheet over dimmed content | Overlay | No (overlay CTA) |
| 4 | Activities Hub | Activity feed / timeline with filter chips | Feature | Yes (3-icon floating pill) |
| 5 | Neural Chat (Dark) | AI chat interface — dark mode variant | Feature | No (chat input only) |
| 6 | Dashboard | Bento grid stats overview (Items/Day, Recall, Streak) | Core | Yes (3-icon floating pill) |
| 7 | Knowledge Sources | File grid with type indicators + sync log | Feature | Yes (3-icon floating pill) |
| 8 | Agent Panel | AI personality selector + directives/memory/capabilities | Feature | Yes (labeled sub-nav) |
| 9 | Profile / Settings | User profile, theme toggle, system config | Core | Yes (3-icon floating pill) |
| 10 | Ingestion Analysis | Data source detail with charts and key insights | Feature | No (action CTA bar) |
| 11 | Global Navigation Hub | Command palette + quick access grid + recent files | Navigation | Yes (4-icon full-width) |
| 12 | Integrations | Connected services + available sources | Feature | Yes (3-icon floating pill) |
| 13 | Analytics | Stats, bar charts, heatmap, scatter plot, resources | Feature | Yes (WHITE bg — anomaly!) |
| 14 | System Navigation Drawer | Full-screen drawer with chat history + settings | Navigation | No (drawer overlay) |
| 15 | Chat + Context Injection (Light) | Chat with file attachment row and context toggle | Feature | No (chat input only) |
| 16 | Response / Export View | Document reader with toolbar and export actions | Feature | No (action bar) |
| 17 | AI Memory Log | Memory diagnostics, terminal, allocation bars | Feature | No (command line input) |
| 18 | Alerts Center | Critical alerts and system notifications | Feature | Yes (3-icon floating pill) |
| 19 | Content Detail | Article reader with AI synthesis + deep link | Feature | No (action CTA bar) |
| 20 | Neural Mesh Map | Interactive node graph with SVG connections | Feature | Yes (3-icon control bar) |

### Nova Theme (12 Screens Available)

| # | Title | Equivalent Black Screen | Key Difference |
|---|-------|------------------------|----------------|
| 1 | Knowledge Sources (Light) | Black #7 | Colored type indicators (PDF=red, IMG=blue, LNK=green, TXT=black) |
| 4 | Profile / Settings (Light) | Black #9 | White bg, black borders, same layout |
| 5 | Neural Chat (Light) | Black #2 | Identical structure, light variant |
| 6 | Dashboard (Light) | Black #6 | White bg, same bento grid |
| 7 | Content Detail (Light) | Black #19 | White bg, same article layout |
| 9 | AI Memory (Light) | Black #17 | White bg, black bars; blinking status animation |
| 10 | Agent Panel (Light) | Black #8 | White bg; same agent personalities + labeled sub-nav |
| 11 | Analytics (Light) | Black #13 | White bg; bottom nav = BLACK floating pill (correct!) |
| 12 | Global Navigation Hub (Light) | Black #11 | White bg; hover-lift transitions; 4-icon full-width nav |
| 13 | Capture Overlay (Light) | Black #3 | Same overlay structure, white bg |
| 14 | System Navigation Drawer (Light) | Black #14 | White bg drawer with drawer-shadow (right shadow only) |
| 20 | Neural Chat (Light) | Black #2 | Has file detail modal overlay |

### Amber Void (1 Screen Available)

| # | Title | Equivalent Black Screen | Key Difference |
|---|-------|------------------------|----------------|
| 3 | Alerts Center | Black #18 | Amber/orange accent colors on black bg; glow effects |

---

## 2. Color Palettes & CSS Custom Properties

### Black Theme

```css
:root {
    --bg-color: #000000;
    --surface-color: #000000;   /* or #111111 in some screens */
    --text-primary: #FFFFFF;
    --text-secondary: #9CA3AF;  /* gray-400 equivalent */
    --border-color: #FFFFFF;
    --border-muted: #333333;
}
```

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#000000` | All screen backgrounds |
| Surface/Card | `#000000` with `border: 1px solid #FFFFFF` | Cards, containers |
| Text Primary | `#FFFFFF` | Headings, body text |
| Text Secondary | `#9CA3AF` | Labels, metadata |
| Border | `#FFFFFF` | Card borders, dividers |
| Grid Lines | `#333333` | Blueprint/grid background |
| Accent (inverted) | `#FFFFFF` bg / `#000000` text | Highlight cards, active states |
| Shadow | `rgba(255,255,255,1)` | Architect shadows (white offset) |

**Light Mode Screens (2, 3, 15):**
```css
:root {
    --bg-color: #FFFFFF;
    --text-primary: #000000;
    --border-color: #000000;
    --grid-lines: #F1F5F9;  /* slate-100 */
    --shadow: rgba(0,0,0,1);
}
```

### Nova Theme

```css
:root {
    --bg-color: #FFFFFF;
    --surface-color: #F8FAFC;   /* slate-50 */
    --text-primary: #000000;
    --text-secondary: #475569;  /* slate-600 */
    --border-color: #000000;
    --border-muted: #E2E8F0;    /* slate-200 */
}
```

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#FFFFFF` | All screen backgrounds |
| Surface/Card | `#FFFFFF` with `border: 1px solid #000000` | Cards |
| Surface Muted | `#F8FAFC` | Drawer header, secondary areas |
| Text Primary | `#000000` | Headings, body text |
| Text Secondary | `#475569` | Labels, metadata |
| Border Primary | `#000000` | Card borders, active states |
| Border Muted | `#E2E8F0` | Subtle dividers, inactive elements |
| Grid Lines | `#F1F5F9` | Blueprint background |
| Shadow | `rgba(0,0,0,1)` | Architect shadows (black offset) |
| Green Status | `#22C55E` / `green-500` | Online indicators |

### Amber Void Theme

```css
:root {
    --bg-color: #000000;
    --surface-color: #0D0D0D;
    --text-primary: #FFFFFF;
    --text-secondary: #9CA3AF;
    --border-color: #332200;         /* dark amber */
    --border-highlight: #FF8C00;     /* dark orange */
    --accent-primary: #FFB800;       /* amber */
    --accent-secondary: #FF8C00;     /* dark amber */
    --accent-critical: #FF4500;      /* red-orange */
}
```

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#000000` | Screen background |
| Grid Lines | `#331A00` | amber-tinted grid |
| Accent Primary | `#FFB800` | Active icons, add button bg, borders |
| Accent Secondary | `#FF8C00` | Architect shadows, border highlights, glows |
| Accent Critical | `#FF4500` | Error states, critical alerts |
| Shadow | `4px 4px 0px 0px #FF8C00` | Amber-colored offset shadow! |
| Glow Text | `text-shadow: 0 0 5px #FF8C00, 0 0 10px #FF4500` | Header glow effect |
| Icon Glow | `filter: drop-shadow(0 0 2px #FF8C00)` | Icon glow effect |

---

## 3. Bottom Navigation Bar Analysis

### Pattern Taxonomy

The designs show **6 distinct bottom navigation patterns** — a critical inconsistency for production:

#### Pattern A: Floating Pill Nav (3 icons + action button) — MOST COMMON

```
┌─────────────────────────────────────────┐
│  [dashboard]  [hub]  [person]  [+ ADD]  │
└─────────────────────────────────────────┘
```

- **Structure:** Centered pill, ~90% width
- **Background:** Black (dark theme) / Black (Nova too)
- **Border:** 1px solid white (Black) / 1px solid black (Nova)
- **Shadow:** `4px 4px 0px 0px rgba(255,255,255,1)` (Black) / `rgba(0,0,0,1)` (Nova)
- **Height:** Auto (~56px content)
- **Position:** `fixed bottom-6 left-1/2 -translate-x-1/2`
- **Icons:** 3 navigation icons + 1 white/amber action button
- **Active state:** White icon / `#FFB800` icon (Amber Void)
- **Inactive state:** `text-gray-500` / opacity-50
- **Used in:** Black #4, #6, #7, #9, #12, #18; Nova #11; Amber Void #3

**Variations within Pattern A:**
| Screen | 4th Button | Difference |
|--------|-----------|------------|
| Black #4, #6, #7, #12 | White `add` button | Standard |
| Black #9 | White `logout` button | Logout instead of add |
| Black #18 | White `close` button | Close instead of add |
| Nova #11 | White `add` button | Same as standard but on black bg in light theme |

#### Pattern B: 5-Icon Full-Width Nav

```
┌──────────────────────────────────────────────────┐
│  Dash    Feed    [+]    Mesh    Agent             │
└──────────────────────────────────────────────────┘
```

- **Used in:** Black #1 ONLY
- **Structure:** Full-width fixed bottom, `h-20`
- **Background:** Black with `border-t border-white`
- **5 icons:** dashboard, dynamic_feed, add_circle (center raised), hub, smart_toy
- **Active state:** White bg square (12x12) behind icon
- **Center button:** Raised circular `w-14 h-14`

#### Pattern C: 4-Icon Full-Width Nav

```
┌──────────────────────────────────────────────────┐
│  home    [SEARCH]    hub    person                │
└──────────────────────────────────────────────────┘
```

- **Used in:** Black #11, Nova #12
- **Structure:** Full-width fixed bottom, `h-[72px]`
- **Background:** Black (Black theme) / White (Nova)
- **Search button:** Raised black square `w-10 h-10` with shadow
- **Labels:** Appear on hover only (tooltip-like)

#### Pattern D: Labeled Sub-Nav (Agent Panel specific)

```
┌──────────────────────────────────────────┐
│  Agents  │  Chat  │  Config              │
└──────────────────────────────────────────┘
```

- **Used in:** Black #8, Nova #10
- **Structure:** Centered pill with labels + dividers
- **Background:** Black with white/20 borders
- **Content:** Icon + text label per item, separated by `w-px h-6 bg-white/20` dividers
- **No add button**

#### Pattern E: Context-Specific Action Bar (NOT true navigation)

```
┌──────────────────────────────────────────┐
│  [Synthesize]                [bookmark]  │
└──────────────────────────────────────────┘
```

- **Used in:** Black #10, #16, #19; Nova #7
- **Purpose:** Screen-specific actions, not navigation
- **Examples:**
  - Screen #10: "Merge to Mesh" CTA
  - Screen #16: Refine / Discard / Save
  - Screen #19 & Nova #7: Synthesize + Bookmark

#### Pattern F: Command Line Input (NOT navigation)

```
┌──────────────────────────────────────────┐
│  > analyze --depth=deep memory_sector_4  │
└──────────────────────────────────────────┘
```

- **Used in:** Black #17, Nova #9
- **Purpose:** Terminal-style command input
- **Shadow:** Architect shadow on input container

### Bottom Nav Color Summary

| Theme | Nav BG | Nav Border | Active Icon | Inactive Icon | Shadow Color |
|-------|--------|------------|-------------|---------------|--------------|
| Black (most) | `#000000` | `#FFFFFF` | `#FFFFFF` | `gray-500` | `rgba(255,255,255,1)` |
| Black #13 | **`#FFFFFF`** ⚠️ | `#000000` | `#000000` | `gray-500` | `rgba(0,0,0,0.2)` |
| Nova | `#000000` | `#000000` | `#FFFFFF` | `gray-500` | `rgba(0,0,0,1)` |
| Amber Void | `#000000` | `#FF8C00` | `#FFB800` | `#FF8C00` (dim) | `#FF8C00` |

---

## 4. Drawer / Sidebar Design

### Structure (Black #14 / Nova #14)

Both themes use the **same structural layout** with only color differences:

```
┌──────────────────────────────┬──────────┐
│  [grid_view]        [close]  │          │
│                              │          │
│  System Uptime: 14:02:51     │  (peek   │
│  Active Mutagens: Stable     │   of bg  │
│                              │   15%)   │
│  [New Thread] │ [Search]     │          │
│                              │          │
│  DATA MANAGEMENT             │          │
│  > Attachment Archive    12  │          │
│                              │          │
│  TODAY — NOV 04              │          │
│  ▌ Quantum Encryption...     │          │
│    Neural Net Optimization   │          │
│                              │          │
│  YESTERDAY — NOV 03          │          │
│    System Architecture...    │          │
│    Legacy Code Migration     │          │
│    Debug Log: Error 404      │          │
│                              │          │
│  PREVIOUS 7 DAYS             │          │
│    Project Titan Init        │          │
│                              │          │
│  ┌─────────────────────────┐ │          │
│  │ [contrast] Swap Theme   │ │          │
│  │ CURRENT: VOID / NOVA    │ │          │
│  └─────────────────────────┘ │          │
│  [settings]      [log out]   │          │
└──────────────────────────────┴──────────┘
```

| Property | Black Theme | Nova Theme |
|----------|------------|------------|
| Width | `w-[85%] max-w-sm` | `w-[85%] max-w-sm` |
| Background | `#000000` | `#FFFFFF` |
| Border | `border-r border-white` | `border-r border-black` |
| Shadow | None (dark on dark) | `drawer-shadow: 10px 0px 20px -5px rgba(0,0,0,0.1)` |
| Header BG | `#111111` | `#F8FAFC` (surface) |
| Active Thread | `border-l-2 border-l-white bg-[#111]` | `border-l-2 border-l-black bg-gray-50` |
| Theme label | "CURRENT: VOID" | "CURRENT: NOVA" |
| Backdrop | `bg-black/50 backdrop-blur-sm` | `bg-white/30 backdrop-blur-sm` |
| Section Groups | Today / Yesterday / Previous 7 Days | Same |
| Bottom Actions | Settings + Log Out | Settings + Log Out |
| Swap Theme Card | Bento card with contrast icon | Same structure |

### Agent Panel Sidebar (Black #8 / Nova #10)

A secondary sidebar pattern exists in the Agent Panel:

| Property | Value |
|----------|-------|
| Width | `w-full md:w-64` |
| Layout | Vertical list of agent personality buttons |
| Active State | Black bg, white text, architect shadow |
| Inactive State | White bg, black text, border only |
| Agents | Architect, Scribe, Alchemist, Outlaw |
| Icons | architecture, history_edu, science, skull |

---

## 5. Key UI Components & Patterns

### 5.1 Bento Cards

The fundamental container element. All cards share:

```css
.bento-card {
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 0px;  /* Neo-brutalist: ALWAYS zero */
    position: relative;
}
```

**Variants:**
- **Standard:** Border only, no shadow
- **With Shadow:** `architect-shadow` class (4px 4px offset)
- **Inverted:** Black bg with white text (e.g., Streak card, Cognitive Load)
- **Interactive:** `hover:bg-black hover:text-white transition-colors`

### 5.2 Architect Shadows

The signature visual element:

| Theme | Shadow Value | Usage |
|-------|-------------|-------|
| Black (dark) | `4px 4px 0px 0px rgba(255,255,255,1)` | Cards, inputs, nav |
| Black (light screens) | `4px 4px 0px 0px rgba(0,0,0,1)` | Same |
| Nova | `4px 4px 0px 0px rgba(0,0,0,1)` | Same |
| Amber Void | `4px 4px 0px 0px #FF8C00` | Amber-colored! |
| Large variant | `8px 8px 0px 0px ...` | Modals/popups (Screen 7, 20) |

**Interactive shadow pattern:**
```css
active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
```

### 5.3 Headers

Consistent sticky header pattern across all screens:

```css
header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--bg-color)/95;
    backdrop-filter: blur(12px);    /* backdrop-blur-md */
    border-bottom: 1px solid var(--border-color);
    padding: 12px 16px;             /* px-4 py-3 */
    display: flex;
    justify-content: space-between;
    align-items: center;
}
```

**Header content patterns:**
1. **Back + Title:** chevron_left + screen name
2. **Menu + Title + Status:** menu icon + title + online indicator
3. **Logo + Title + Date:** Polymath logo + "PolymathOS" + date

### 5.4 Grid Backgrounds

Three background patterns used:

| Pattern | CSS | Theme |
|---------|-----|-------|
| Blueprint | `linear-gradient(#F1F5F9 1px, transparent 1px)` at 20px | Nova, Black light |
| Dark Grid | `linear-gradient(#333 1px, transparent 1px)` at 40px | Black dark |
| Amber Grid | `linear-gradient(#331a00 1px, transparent 1px)` at 40px | Amber Void |
| Dot Grid | `radial-gradient(circle, #fff 1px, transparent 1px)` at 24px | Mesh Map (Black #20) |

### 5.5 Stat Cards

Consistent pattern for displaying metrics:

```html
<div class="bento-card p-3 flex flex-col justify-between aspect-square">
    <div class="flex justify-between items-start">
        <span class="material-symbols-outlined">icon</span>
        <span class="font-mono text-[10px] bg-[accent] text-[inverse]">BADGE</span>
    </div>
    <div>
        <div class="text-3xl font-display font-bold">VALUE</div>
        <div class="text-[10px] font-mono uppercase tracking-wide text-secondary">LABEL</div>
    </div>
</div>
```

### 5.6 Chat Bubbles

| Property | AI Bubble | User Bubble |
|----------|----------|-------------|
| Black Dark | `bg-black border border-white` | `bg-white text-black` |
| Black Light | `bg-white border border-black` | `bg-black text-white` |
| Nova | `bg-white border border-black` | `bg-black text-white` |
| Max Width | `max-w-[85%]` | `max-w-[85%]` |
| Alignment | `margin-right: auto` | `margin-left: auto` |
| Shadow | architect-shadow | architect-shadow |
| Avatar | 4x4 black box with white `smart_toy` icon | 4x4 white box with black `person` icon |

### 5.7 Progress Bars

```css
.progress-bar {
    height: 8px;        /* h-2 */
    width: 100%;
    background: gray-100 (Nova) / gray-800 (Black);
    border: 1px solid;
}
.progress-fill {
    height: 100%;
    background: black (Nova) / white (Black) / #FFB800 (Amber);
}
```

### 5.8 Toggle Switches (Integrations)

Custom-styled using `<input type="checkbox">` with Tailwind:
- Track: `w-12 h-6 bg-gray-700` (Black) / `bg-gray-200` (Nova)
- Thumb: `w-5 h-5 bg-white` (Black) / `bg-white` (Nova)
- Active: `bg-white` track (Black) / `bg-black` track (Nova)
- Shape: `rounded-none` — square toggles consistent with neo-brutalist style

### 5.9 Modals / Popups

Used for file details (Black #7, Nova #20):

```css
.modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 60;
    background: rgba(0,0,0,0.10);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
}
.modal-content {
    width: 100%;
    max-width: 24rem;    /* max-w-sm */
    background: white/black;
    border: 1px solid;
    box-shadow: 8px 8px 0px 0px ...;  /* architect-shadow-lg */
}
```

### 5.10 Form Inputs

```css
input, textarea {
    border: 1px solid var(--border-color);
    border-radius: 0px;
    font-family: var(--font-mono);
    font-size: 14px;    /* text-sm */
    background: transparent;
    /* Focus ring disabled: focus:ring-0 */
    /* Focus border: focus:border-[var(--border-color)] */
}
```

### 5.11 Buttons

**Primary CTA:**
```css
.btn-primary {
    background: black;     /* Nova */ | white; /* Black dark */
    color: white;          /* Nova */ | black; /* Black dark */
    border: 1px solid;
    font-family: var(--font-display) OR var(--font-mono);
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    box-shadow: architect-shadow;
}
```

**Secondary / Ghost:**
```css
.btn-secondary {
    background: transparent;
    border: 1px solid var(--border-color);
    /* hover: invert colors */
    hover:bg-black hover:text-white;  /* Nova */
    hover:bg-white hover:text-black;  /* Black */
}
```

---

## 6. Typography System

### Font Stack

| Role | Family | Weight | CSS Variable |
|------|--------|--------|--------------|
| Display / Headings | Space Grotesk | 400, 500, 700 | `--font-display` |
| Body / UI Text | Inter | 400, 500, 600 | `--font-body` |
| Monospace / Labels | JetBrains Mono | 400, 500, (700 in some) | `--font-mono` |

### Type Scale

| Element | Font | Size | Weight | Transform | Tracking |
|---------|------|------|--------|-----------|----------|
| Screen Title (H1) | Space Grotesk | `text-2xl` (24px) | `font-bold` | `uppercase` | `tracking-tighter` |
| Article Title | Space Grotesk | `text-4xl` (36px) | `font-bold` | None | `tracking-tight` |
| Section Heading | Space Grotesk | `text-lg` (18px) | `font-bold` | `uppercase` | `tracking-tight` |
| Card Heading | Space Grotesk | `text-sm` (14px) | `font-bold` | `uppercase` | — |
| Body Text | Inter | `text-sm` (14px) | `font-normal` | None | — |
| Metadata Label | JetBrains Mono | `text-[10px]` | `font-normal` | `uppercase` | `tracking-widest` |
| Category Badge | JetBrains Mono | `text-[10px]` | `font-bold` | `uppercase` | — |
| Tiny Label | JetBrains Mono | `text-[9px]` | `font-normal` | `uppercase` | `tracking-wider` |
| Stat Value | Space Grotesk | `text-3xl` (30px) | `font-bold` | — | — |
| Terminal Text | JetBrains Mono | `text-[10px]` | `font-normal` | — | — |

### Font Anomaly

**Black Screen #4 (Activities Hub)** uses `Archivo Narrow` as display font instead of Space Grotesk. This is the ONLY screen with this deviation.

---

## 7. Icon System

### Library

- **Material Symbols Outlined** (Google Fonts CDN)
- Variable font with axis: `wght` (100-700), `FILL` (0-1), `GRAD` (0), `opsz` (24)
- Default: unfilled, weight 400

### Icon Sizing

| Context | Size | Example |
|---------|------|---------|
| Bottom Nav | `text-[20px]` - `text-[24px]` | dashboard, hub, person |
| Header Actions | `text-[18px]` - `text-[20px]` | chevron_left, menu, share |
| Card Icons | `text-[16px]` - `text-[18px]` | memory, database, speed |
| Quick Access | `text-[28px]` | dashboard, hub, monitoring |
| Tiny Indicators | `text-[10px]` - `text-[14px]` | smart_toy (avatar), article |

### Icon Fill Variants (Nova #12)

```css
.icon-stroke {
    font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
}
.icon-fill {
    font-variation-settings: 'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24;
}
```

### Commonly Used Icons

| Icon Name | Usage |
|-----------|-------|
| `dashboard` | Nav — Dashboard |
| `hub` | Nav — Neural Mesh / Knowledge |
| `person` | Nav — Profile |
| `add` / `add_circle` | Nav — New item / Capture |
| `smart_toy` | AI avatar in chat |
| `psychology` | AI/brain features |
| `memory` | AI Memory |
| `search` | Search |
| `settings` | Settings |
| `chevron_left` | Back navigation |
| `menu` / `menu_open` | Drawer toggle |
| `architecture` | Architect agent |
| `history_edu` | Scribe agent |
| `science` | Alchemist agent |
| `skull` | Outlaw agent |
| `arrow_forward` | CTA accent |
| `arrow_upward` | Send message |
| `contrast` | Theme toggle |
| `close` | Dismiss |

---

## 8. Spacing, Sizing & Layout

### Screen Container

```css
body {
    min-height: max(884px, 100dvh);  /* Minimum design height */
}
main {
    padding: 24px 16px 128px 16px;   /* px-4 pb-32 pt-6 */
    max-width: 28rem;                 /* max-w-md (448px) */
    margin: 0 auto;
}
```

### Spacing Scale (Tailwind)

| Token | Value | Usage |
|-------|-------|-------|
| `gap-1` | 4px | Icon groups, tiny gaps |
| `gap-2` | 8px | Button icon + text |
| `gap-3` | 12px | Card grids, section gaps |
| `gap-4` | 16px | Standard section spacing |
| `gap-6` | 24px | Major section spacing |
| `space-y-4` | 16px | Vertical stack spacing |
| `space-y-6` | 24px | Section vertical spacing |

### Common Sizes

| Element | Size |
|---------|------|
| Header height | `h-16` (64px) or auto ~56px |
| Bottom nav height | ~56-72px |
| Nav icon button | `w-10 h-10` or `w-8 h-8` |
| Add button | `w-10 h-10` |
| Avatar | `w-8 h-8` |
| Status dot | `w-2 h-2` |
| Card padding | `p-3`, `p-4`, or `p-5` |
| Grid cell | `aspect-square` or `h-24` - `h-32` |

### Layout Patterns

1. **Bento Grid:** `grid grid-cols-2 gap-4` or `grid grid-cols-3 gap-3` (stat cards)
2. **Full-width card stack:** `space-y-4` or `space-y-6`
3. **Split layout:** `flex flex-col md:flex-row` (Agent Panel)
4. **Floating overlay:** `fixed inset-0 z-50/60` with backdrop blur

---

## 9. Inconsistencies & Anomalies

### CRITICAL: Bottom Navigation Inconsistency

| Issue | Details | Screens |
|-------|---------|---------|
| **6 different nav patterns** | No single consistent bottom nav across screens | All |
| **Screen #1 has 5 icons** | All other nav screens have 3-4 icons | Black #1 |
| **Screen #13 inverted colors** | White bg nav in dark theme | Black #13 |
| **4th button changes** | Add → Logout → Close depending on screen | Black #9, #18 |
| **Some screens have NO nav** | Chat, detail, overlay screens lack navigation | 8 screens |

**Recommendation:** Standardize on Pattern A (floating pill with 3 icons + action button) for all main screens, use Pattern E for detail/action screens.

### Font Inconsistency

| Issue | Screen | Expected | Actual |
|-------|--------|----------|--------|
| Wrong display font | Black #4 (Activities Hub) | Space Grotesk | **Archivo Narrow** |

### Color Inconsistencies

| Issue | Details |
|-------|---------|
| `--surface-color` not defined in Black Theme | Most screens use `#000000` but it's not declared as a CSS variable |
| `--border-muted` varies | `#333333` in some Black screens, `#E2E8F0` in Nova, not always declared |
| Green status dot uses `rounded-full` | Violates `border-radius: 0` rule (minor — status indicators may be exempt) |

### Grid Background Variations

| Issue | Details |
|-------|---------|
| Grid size varies | 20px (Nova blueprint), 24px (some Nova), 40px (Black dark) |
| Grid color varies | `#F1F5F9`, `#f0f0f0`, `#f1f1f1`, `#E5E7EB` in different Nova screens |

### Missing `border-radius: 0` Override

Most screens rely on Tailwind's default `rounded-none` or class-level styling. Only Nova Screen #9 includes the explicit global override:
```css
* { border-radius: 0px !important; }
```
Other screens should include this for safety.

### Type Indicator Colors (Nova vs Black)

| Theme | File Type Indicators |
|-------|---------------------|
| Black #7 | All monochrome: `bg-white text-black` |
| Nova #1 | **Colored:** PDF=`bg-red-50 text-red-600`, IMG=`bg-blue-50 text-blue-600`, LNK=`bg-green-50 text-green-600` |

This is a deliberate design difference between themes, but should be documented as a theming decision.

---

## 10. Theming System Recommendations

### Token Architecture

Based on the analysis, here's the recommended CSS custom property structure for a unified theming system:

```typescript
interface ThemeTokens {
    // Core Colors
    bgPrimary: string;         // Screen background
    bgSurface: string;         // Card/container background
    bgSurfaceMuted: string;    // Secondary surface (drawer headers)
    bgInverted: string;        // Inverted card background
    
    // Text
    textPrimary: string;       // Main text
    textSecondary: string;     // Metadata, labels
    textInverted: string;      // Text on inverted bg
    textOnAccent: string;      // Text on accent bg
    
    // Borders
    borderPrimary: string;     // Card borders, active dividers
    borderMuted: string;       // Subtle dividers
    
    // Accents (mainly for Amber Void, but extensible)
    accentPrimary: string;     // Primary accent color
    accentSecondary: string;   // Secondary accent
    accentCritical: string;    // Error/critical states
    
    // Shadows
    shadowColor: string;       // Architect shadow color
    shadowOffset: string;      // "4px 4px 0px 0px"
    
    // Grid / Background Pattern
    gridLineColor: string;     // Blueprint grid line color
    gridSize: string;          // Grid spacing (should standardize to 20px)
    
    // Navigation
    navBg: string;             // Bottom nav background
    navBorder: string;         // Bottom nav border
    navActiveIcon: string;     // Active nav icon color
    navInactiveIcon: string;   // Inactive nav icon color
    navActionBg: string;       // Add/action button bg
    navActionText: string;     // Add/action button text
    
    // Glow Effects (Amber Void specific, null for others)
    glowPrimary?: string;      // text-shadow glow
    glowSecondary?: string;    // icon drop-shadow glow
    
    // Status
    statusOnline: string;      // Green dot
    statusWarning: string;     // Warning color
    statusCritical: string;    // Critical color
}
```

### Concrete Theme Values

```typescript
const themes: Record<string, ThemeTokens> = {
    nova: {
        bgPrimary: '#FFFFFF',
        bgSurface: '#FFFFFF',
        bgSurfaceMuted: '#F8FAFC',
        bgInverted: '#000000',
        textPrimary: '#000000',
        textSecondary: '#475569',
        textInverted: '#FFFFFF',
        textOnAccent: '#FFFFFF',
        borderPrimary: '#000000',
        borderMuted: '#E2E8F0',
        accentPrimary: '#000000',
        accentSecondary: '#64748B',
        accentCritical: '#EF4444',
        shadowColor: 'rgba(0,0,0,1)',
        shadowOffset: '4px 4px 0px 0px',
        gridLineColor: '#F1F5F9',
        gridSize: '20px',
        navBg: '#000000',
        navBorder: '#000000',
        navActiveIcon: '#FFFFFF',
        navInactiveIcon: '#6B7280',
        navActionBg: '#FFFFFF',
        navActionText: '#000000',
        statusOnline: '#22C55E',
        statusWarning: '#F59E0B',
        statusCritical: '#EF4444',
    },
    void: {  // Black Theme
        bgPrimary: '#000000',
        bgSurface: '#000000',
        bgSurfaceMuted: '#111111',
        bgInverted: '#FFFFFF',
        textPrimary: '#FFFFFF',
        textSecondary: '#9CA3AF',
        textInverted: '#000000',
        textOnAccent: '#000000',
        borderPrimary: '#FFFFFF',
        borderMuted: '#333333',
        accentPrimary: '#FFFFFF',
        accentSecondary: '#9CA3AF',
        accentCritical: '#EF4444',
        shadowColor: 'rgba(255,255,255,1)',
        shadowOffset: '4px 4px 0px 0px',
        gridLineColor: '#333333',
        gridSize: '40px',
        navBg: '#000000',
        navBorder: '#FFFFFF',
        navActiveIcon: '#FFFFFF',
        navInactiveIcon: '#6B7280',
        navActionBg: '#FFFFFF',
        navActionText: '#000000',
        statusOnline: '#22C55E',
        statusWarning: '#F59E0B',
        statusCritical: '#EF4444',
    },
    amberVoid: {
        bgPrimary: '#000000',
        bgSurface: '#0D0D0D',
        bgSurfaceMuted: '#111111',
        bgInverted: '#FFB800',
        textPrimary: '#FFFFFF',
        textSecondary: '#9CA3AF',
        textInverted: '#000000',
        textOnAccent: '#000000',
        borderPrimary: '#332200',
        borderMuted: '#1A1100',
        accentPrimary: '#FFB800',
        accentSecondary: '#FF8C00',
        accentCritical: '#FF4500',
        shadowColor: '#FF8C00',
        shadowOffset: '4px 4px 0px 0px',
        gridLineColor: '#331A00',
        gridSize: '40px',
        navBg: '#000000',
        navBorder: '#FF8C00',
        navActiveIcon: '#FFB800',
        navInactiveIcon: '#FF8C00',
        navActionBg: '#FFB800',
        navActionText: '#000000',
        glowPrimary: '0 0 5px #FF8C00, 0 0 10px #FF4500',
        glowSecondary: 'drop-shadow(0 0 2px #FF8C00)',
        statusOnline: '#FFB800',
        statusWarning: '#FF8C00',
        statusCritical: '#FF4500',
    },
};
```

### Standardization Priorities

1. **Bottom Nav:** Standardize on floating pill (Pattern A) for all main screens. Use 3 primary icons + 1 action button consistently.
2. **Grid Background:** Normalize to 20px grid size across all themes.
3. **Font:** Remove Archivo Narrow usage; use Space Grotesk everywhere as display font.
4. **Border Radius:** Add global `* { border-radius: 0px !important; }` to all themes.
5. **CSS Variables:** Ensure all themes declare the same set of custom properties.
6. **Shadow Consistency:** Keep `4px 4px 0px 0px [color]` as standard, `8px 8px` for modals only.
7. **File Type Indicators:** Decide between monochrome (Black) vs colored (Nova) approach and make it a theme token.

---

## Appendix: Screen-to-Screen Cross-Theme Mapping

| Screen Purpose | Black # | Nova # | Amber Void # |
|---------------|---------|--------|--------------|
| Dashboard | 6 | 6 | — |
| Neural Chat | 2, 5, 15 | 5, 20 | — |
| Capture Overlay | 3 | 13 | — |
| Activities Hub | 4 | — | — |
| Knowledge Sources | 7 | 1 | — |
| Agent Panel | 8 | 10 | — |
| Profile / Settings | 9 | 4 | — |
| Ingestion Analysis | 10 | — | — |
| Global Nav Hub | 11 | 12 | — |
| Integrations | 12 | — | — |
| Analytics | 13 | 11 | — |
| System Drawer | 14 | 14 | — |
| Response / Export | 16 | — | — |
| AI Memory Log | 17 | 9 | — |
| Alerts Center | 18 | — | 3 |
| Content Detail | 19 | 7 | — |
| Neural Mesh Map | 20 | — | — |
| Neural Mesh Detail | 1 | — | — |
