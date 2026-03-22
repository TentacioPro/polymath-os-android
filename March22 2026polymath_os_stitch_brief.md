# Polymath OS — Google Stitch UI/UX Generation Brief

> **Purpose**: Feed this document into Google Stitch to generate multiple UI/UX layout variants for the Polymath OS mobile/web application. It contains the complete backend API surface, application philosophy, Kole Jain design skills manifest, design-token inventory, screen map, and component catalog.

---

## 1. Application Philosophy & Identity

**What is Polymath OS?**
A premium, AI-powered "Learning Operating System" that tracks, connects, and optimizes a user's cross-domain learning journey. It ingests activities from manual entry, file uploads (YouTube/Google history), and API integrations, then uses GPT-4o-mini to auto-categorize content, discover knowledge connections, and provide personalized learning recommendations.

**Core Pillars**:
| Pillar | Description |
|---|---|
| **Track** | Capture learning activities from any source (voice, link, scan, file) via a floating Quick-Capture pill |
| **Connect** | AI discovers relationships between disparate knowledge domains ("Dots to Connect") |
| **Reflect** | Journaling system linked to activities, with tag-based organization |
| **Evolve** | Persistent AI agent with memory that learns from user behavior over time |
| **Own** | Full data portability — export JSON/Markdown/CSV/PDF/PPT, restore from backup |

**Personality**: Dark-first, premium, "obsidian terminal" aesthetic — think a luxury instrument panel, not a productivity app. 7 curated themes with zero generic colors.

---

## 2. Theme System (7 Palettes)

Each theme is a full Material You (M3) tonal palette. Generate layouts in **at least 3 themes** for variety:

| Theme Name | Surface | Primary | Mood |
|---|---|---|---|
| **TRUE TECH VOID** | `#000000` (True Black) | `#C0C0C0` (Silver) | Monochrome obsidian terminal |
| **NOVA LIGHT** | `#FFFFFF` (Pure White) | `#1A1A1A` (Slate) | Clean, editorial light mode |
| **AMBER NEURAL** | `#0A0A0A` (Charcoal) | `#FFB800` (Amber) | Warm, neural-network glow |
| **CYBER OCEAN** | `#050A15` (Deep Navy) | `#00F2FF` (Cyan) | Cool, cyberpunk blue |
| **EMERALD FOREST** | `#080C08` (Obsidian) | `#00FF88` (Neon Green) | Matrix/hacker aesthetic |
| **CRIMSON BLAZE** | `#120505` (Crimson Black) | `#FF4D4D` (Crimson) | Intense, fiery red |
| **COSMIC MIDNIGHT** | `#0A0515` (Purple Void) | `#FF00FF` (Fuchsia) | Cyberpunk violet |

**Token Groups per Theme**: `primary`, `onPrimary`, `primaryContainer`, `onPrimaryContainer`, `secondary`, `tertiary`, full surface tonal ladder (5 levels), `outline`, `outlineVariant`, `inverseSurface`, `error`/`success`/`warning`/`info` with containers, `categories` (AI, News, Tools, Market, Research, Tutorial, Other).

---

## 3. Kole Jain Design Skills — Constraint Manifest

> These are the **hard rules** that EVERY layout variant must obey.

### Phase 1: Spatial Architecture
| Skill | Rule |
|---|---|
| **8-Point Spatial Rhythm** | All spacing ∈ {4, 8, 16, 24, 32, 48, 64, 96}px. No arbitrary primes. Rule of Thirds for macro-layout. |
| **Bento Grid** | 12-col (desktop) / 4-col (mobile). Modular 2×2 bento containers. F-pattern or Z-pattern visual flow. Highest priority → top-left. |
| **Container-Query Responsive** | Compact (≤300px), Medium (≤600px), Expanded (≥601px). Use container-type: inline-size, not viewport media queries for internal components. |
| **Algorithmic Dimensioning** | `Target Width = Computed Height × 2` for pill-shaped elements. Minimum tap target: 44×44px (WCAG 2.1). |

### Phase 2: Mathematical Typography
| Skill | Rule |
|---|---|
| **Geometric Scaling** | Max 2 font families. Base 16px (desktop)/14px (mobile). Scale headings via `size_n = base × ratio^(n-1)` (ratio = 1.25×). Line length: 60–75 chars. |
| **Line Height** | Body: 1.5×, Small/Label: 1.4×, Headings: 1.1–1.2×. Letter-spacing: -2% to -3% on display text only. |
| **Iconometry** | Icon bounding box = adjacent text's line-height. Snap to 4px grid. Always `align-items: center`. |

### Phase 3: Color & Dimensional Physics
| Skill | Rule |
|---|---|
| **4-Layer Semantic Color** | Layer 1 (canvas bg) → Layer 2 (elevated surfaces via HSL lightness +3–5%/step) → Layer 3 (text/icons: 87%/60%/38% opacity cascade) → Layer 4 (accents/CTAs). |
| **Dark Mode Physics** | Zero box-shadows. Z-axis = HSL lightness. Base canvas ≤15% lightness. Desaturate accents 15–20% in dark contexts. |
| **Light Mode Depth** | Near-invisible shadows (opacity ≤8%, max blur). Pronounced shadows only for transient elements (dropdowns, popovers). |
| **Glassmorphism** | `backdrop-filter: blur(10–20px)` + 1px white inside border + subtle inner shadow. Limit backdrop-filter to <50% viewport. |

### Phase 4: Interaction Mechanics
| Skill | Rule |
|---|---|
| **State Matrix** | Every interactive element must have: Default, Hover (1.02× scale, +5% brightness), Pressed (0.98× scale, inset shadow), Focus (2px semantic ring), Disabled (0.5 opacity, grayscale), Loading (shimmer), Error, Success states. |
| **Cognitive Routing** | Simple tasks (≤2 inputs, non-destructive) → Popover. Complex/destructive → full-screen blurred Modal. |
| **Optimistic UI** | Instant local DOM mutation + success toast → async server call → revert only on error. |
| **Micro-Interaction Timing** | 150–200ms micro, 200–300ms component. ease-out for enter, ease-in for exit. 300ms hover tooltip delay. |

### Phase 5: Accessibility & Anti-Vibe
| Skill | Rule |
|---|---|
| **Accessibility** | 4.5:1 text contrast, 3:1 boundary contrast. `prefers-reduced-motion` → durations to 0.01ms. Semantic HTML (`<button>` for actions, `<a>` for nav). |
| **GPU-Only Animation** | Animate `transform` and `opacity` only. Strip transitions on layout properties (width, height, margin, padding). |
| **Vibe Suppression** | No emoji-as-icons (use Phosphor/Lucide). Mute hyper-saturated hex codes. Remove dead cards (no actionable data). No lorem ipsum. |

### Phase 6: System Architecture
| Skill | Rule |
|---|---|
| **Atomic Design** | Tokens → Atoms (Button, Chip, TextField) → Molecules (Card, StatRing) → Organisms (Dashboard, Neural Mesh). Each data container needs a progressive-disclosure empty state. |
| **Presentation** | Portfolio mode: CSS 3D perspective skews. Enterprise mode: realistic environmental mockups. |

---

## 4. Design Token Inventory (Implemented)

### Spacing (8-Point Grid)
```
xs: 4  |  sm: 8  |  md: 16  |  lg: 24  |  xl: 32  |  xxl: 48  |  section: 64  |  hero: 96
```

### Typography Scale (M3 + Kole Jain)
```
displayLarge:   57px / lh 64  / ls -1.00    headlineLarge:  32px / lh 36 / ls 0
displayMedium:  45px / lh 52  / ls -0.75    headlineMedium: 28px / lh 32 / ls 0
displaySmall:   36px / lh 40  / ls -0.50    headlineSmall:  24px / lh 28 / ls 0
titleLarge:     22px / lh 24  / ls 0        bodyLarge:      16px / lh 24 / ls 0.5
titleMedium:    16px / lh 20  / ls 0.15     bodyMedium:     14px / lh 20 / ls 0.25
titleSmall:     14px / lh 16  / ls 0.1      bodySmall:      12px / lh 16 / ls 0.4
labelLarge:     14px / lh 20  / ls 0.1      labelMedium:    12px / lh 16 / ls 0.5
                                             labelSmall:     11px / lh 16 / ls 0.5
```

### Font Options
`DM Sans` (default) | `Inter` | `Outfit` | `Space Grotesk` — each with regular/medium/bold.
Mono: `JetBrains Mono` | `Space Mono`.

### Radii
```
none: 0  |  xs: 4  |  sm: 8  |  md: 12  |  lg: 16  |  xl: 28  |  2xl: 32  |  full: 9999 (pills)
```

### Icon Sizes
```
xs: 16  |  sm: 20  |  md: 24  |  lg: 32  |  xl: 40
```

### Motion
```
Spring presets: gentle (d:20 s:150 m:1)  |  bouncy (d:12 s:200 m:0.8)  |  snappy (d:18 s:300 m:0.6)  |  stiff (d:30 s:400 m:1)
Easing:   standard, standardDecel, standardAccel, emphasized, emphasizedDecel, emphasizedAccel
Duration: short1-4 (50-200ms)  |  medium1-4 (250-400ms)  |  long1-4 (450-600ms)  |  extraLong1-2 (700-800ms)
```

### Z-Index Scale
```
base: 0  |  card: 1  |  stickyHeader: 10  |  fab: 20  |  navRail: 30  |  topBar: 40
overlay: 50  |  sheet: 60  |  dialog: 70  |  toast: 80  |  tooltip: 90
```

---

## 5. Complete Backend API Surface (35 Endpoints)

> Generate layouts showing how data from each endpoint group maps to UI surfaces.

### 5.1 Authentication (5 endpoints)

| Method | Path | Purpose | UI Surface |
|---|---|---|---|
| POST | `/api/auth/register` | Create user account | Register screen (full-page form) |
| POST | `/api/auth/login` | Authenticate, return JWT pair | Login screen |
| POST | `/api/auth/refresh` | Get new tokens | Background (invisible) |
| POST | `/api/auth/logout` | Revoke refresh token | Profile → Logout button |
| GET | `/api/auth/me` | Current user profile | Profile screen header |

### 5.2 Activities (6 endpoints)

| Method | Path | Purpose | UI Surface |
|---|---|---|---|
| POST | `/api/activities/manual` | Create manual activity | Quick Capture → Link/manual input |
| POST | `/api/activities/upload` | Upload YouTube/Google history | Quick Capture → File action |
| GET | `/api/activities` | List all (pagination, category filter) | Knowledge tab list |
| GET | `/api/activities/{id}` | Single activity + related connections | Activity Detail screen |
| DELETE | `/api/activities/{id}` | Remove activity | Swipe-to-delete / detail action |
| PATCH | `/api/activities/{id}` | Update title/url/notes | Edit dialog on detail screen |

### 5.3 Journals (4 endpoints)

| Method | Path | Purpose | UI Surface |
|---|---|---|---|
| POST | `/api/journals` | Create journal entry | Journal screen → "New Entry" |
| GET | `/api/journals` | List all journal entries | Journal screen list |
| PUT | `/api/journals/{id}` | Update journal content | Journal edit view |
| DELETE | `/api/journals/{id}` | Remove journal | Swipe-to-delete |

### 5.4 AI Operations (4 endpoints)

| Method | Path | Purpose | UI Surface |
|---|---|---|---|
| POST | `/api/ai/analyze/{id}` | Re-analyze activity with AI | Activity detail → "Re-analyze" button |
| POST | `/api/ai/generate-connections/{id}` | Generate connections for activity | Activity detail → "Find connections" |
| GET | `/api/connections` | Get all knowledge connections | Mesh tab (Neural Mesh graph) |
| GET | `/api/ai/suggestions` | AI learning recommendations | Home tab → Suggestions card |

### 5.5 AI Configuration (2 endpoints)

| Method | Path | Purpose | UI Surface |
|---|---|---|---|
| POST | `/api/ai-config` | Set AI provider/model/key | Integrations screen |
| GET | `/api/ai-config` | Get active AI config | Integrations screen (display) |

### 5.6 Search & Notifications (2 endpoints)

| Method | Path | Purpose | UI Surface |
|---|---|---|---|
| GET | `/api/search?q=` | Full-text search (activities, journals, connections) | Search overlay (search screen) |
| GET | `/api/notifications` | System notifications (connections, learning events, hints) | Alerts screen |

### 5.7 URL Metadata (1 endpoint)

| Method | Path | Purpose | UI Surface |
|---|---|---|---|
| POST | `/api/metadata/extract` | Extract OG/meta tags from URL | Quick Capture → Link Preview card |

### 5.8 Export / Import (4 endpoints)

| Method | Path | Purpose | UI Surface |
|---|---|---|---|
| POST | `/api/export/json` | Full data export as JSON | Export screen |
| POST | `/api/export/markdown` | Export as Markdown | Export screen |
| POST | `/api/export/csv` | Export as CSV | Export screen |
| POST | `/api/import/restore` | Restore from JSON backup | Export screen → Import tab |

### 5.9 Statistics (1 endpoint)

| Method | Path | Purpose | UI Surface |
|---|---|---|---|
| GET | `/api/stats` | Dashboard statistics (totals, categories, sources) | Home tab → StatRings, StatCards |

### 5.10 Agent Memory System (10 endpoints)

| Method | Path | Purpose | UI Surface |
|---|---|---|---|
| GET | `/api/agent/memory` | List agent memories (filterable by type) | Agent screen → Memory list |
| POST | `/api/agent/memory` | Create memory manually | Agent screen → "Add memory" |
| PUT | `/api/agent/memory/{id}` | Update memory content/importance | Agent screen → Edit dialog |
| DELETE | `/api/agent/memory/{id}` | Delete specific memory | Agent screen → Swipe-to-delete |
| POST | `/api/agent/learn` | Trigger learning from current data | Agent screen → "Train" button |
| POST | `/api/agent/consolidate` | Merge short→long-term memories | Agent screen → "Consolidate" button |
| GET | `/api/agent/persona` | Get active persona config | Agent/Chat screen header |
| PUT | `/api/agent/persona` | Update persona (name, role, traits) | Customize screen |
| GET | `/api/agent/learning-logs` | View learning progression | Agent screen → Learning log timeline |
| GET | `/api/agent/chat?message=` | Memory-enhanced chat with agent | Chat screen |

### 5.11 System (2 endpoints)

| Method | Path | Purpose | UI Surface |
|---|---|---|---|
| GET | `/api/health` | Health check (DB, AI status) | (Internal / status indicator) |
| GET | `/api/` | API root | (Not displayed) |

---

## 6. Screen Map & Navigation Architecture

### Primary Navigation: Bottom Tab Bar (3 tabs)

```
┌─────────────────────────────────────────┐
│  [Home]        [Knowledge]       [Mesh] │
│  home icon     library icon    network  │
└─────────────────────────────────────────┘
```

### Full Screen Inventory (21 screens)

| Screen | Route | Data Sources | Key Components |
|---|---|---|---|
| **Home (Dashboard)** | `/(tabs)/index` | `/api/stats`, `/api/activities`, `/api/ai/suggestions`, `/api/notifications` | StatRings, StatCards, BentoCards, SectionHeaders, activity timeline |
| **Knowledge** | `/(tabs)/knowledge` | `/api/activities` | Activity list with category chips, search, filter |
| **Neural Mesh** | `/(tabs)/mesh` | `/api/connections`, `/api/activities` | Network graph visualization, timeline view, AI suggestions |
| **Activity Detail** | `/activity-detail` | `/api/activities/{id}` | Full detail card, related connections, re-analyze action |
| **Chat** | `/chat` | `/api/agent/chat` | Message bubbles, persona header, memory indicator |
| **Agent** | `/agent` | `/api/agent/memory`, `/api/agent/stats`, `/api/agent/learning-logs` | Memory list, learning log timeline, train/consolidate actions |
| **Journal** | `/journal` | `/api/journals` | Journal list, create/edit form, tag chips, linked activities |
| **Search** | `/search` | `/api/search` | SearchOverlay, unified results (activities, journals, connections) |
| **Alerts** | `/alerts` | `/api/notifications` | Notification cards with type badges (info/success/warning) |
| **Analytics** | `/analytics` | `/api/stats`, `/api/activities` | Charts, category breakdown, source distribution |
| **Export** | `/export` | `/api/export/*`, `/api/import/restore` | Format selector chips, export action buttons, import upload |
| **Profile** | `/profile` | `/api/auth/me` | User avatar, display name, email, logout |
| **Login** | `/login` | `/api/auth/login` | Email/password fields, submit button, register link |
| **Register** | `/register` | `/api/auth/register` | Multi-field form, password validation |
| **Onboarding** | `/onboarding` | — | Welcome carousel, feature highlights |
| **Appearance** | `/appearance` | — | 7-theme picker (color swatches), font selector, live preview |
| **Customize** | `/customize` | `/api/agent/persona` | Persona name/role/traits/instructions editors |
| **Integrations** | `/integrations` | `/api/ai-config` | AI provider cards, API key input, model selector |

### Overlay Components (always-available)

| Component | Trigger | Description |
|---|---|---|
| **CollapsibleHeader** | Scroll | Top bar with hamburger menu, app title, search icon; collapses on scroll |
| **MobileDrawer** | Hamburger tap | Full navigation drawer (links to all screens, user profile header) |
| **QuickCapture** | FAB "+" tap | Bottom sheet with 4 quick-action modes: Voice, Link, Scan, File |
| **SearchOverlay** | Search icon | Full-screen search with `/api/search` integration |
| **M3BottomSheet** | Various | Reusable bottom sheet for contextual actions |
| **M3Dialog** | Various | Modal dialog for confirmations, destructive actions |
| **Popover** | Long-press / info | Lightweight popover for small info panels |

---

## 7. Component Catalog (33 Reusable Components)

### UI Primitives (23)
| Component | Type | Notes |
|---|---|---|
| `M3Button` | Atom | Filled / Outlined / Text / Tonal — respects `buttonMinWidth(height)` |
| `M3Card` | Molecule | Tonal surface elevation, outline variant border |
| `M3Chip` | Atom | Category badges, filter chips — `primaryContainer` active bg |
| `M3TextField` | Atom | Outlined input with focus ring, error state |
| `M3Switch` | Atom | Toggle with primary color track |
| `M3Dialog` | Organism | Scrim overlay + content card |
| `M3BottomSheet` | Organism | Draggable sheet from bottom |
| `M3Progress` | Atom | Linear / circular progress indicators |
| `M3RefreshIndicator` | Atom | Pull-to-refresh spinner |
| `FAB` | Atom | Floating Action Button with label |
| `Badge` | Atom | Small notification count badge |
| `BentoCard` | Molecule | Dashboard bento-grid container |
| `StatCard` | Molecule | Metric display card (number + label) |
| `StatRing` | Molecule | Circular progress ring for stats |
| `SectionHeader` | Atom | Section title + optional action link |
| `Skeleton` | Atom | Loading shimmer placeholder |
| `EmptyState` | Molecule | Icon + explanation + action button for empty data |
| `AIProgress` | Molecule | AI processing indicator with animation |
| `ArchitectButton` | Atom | Special CTA button variant |
| `DialogProvider` | Utility | Context provider for global dialog state |
| `SearchOverlay` | Organism | Full-screen search with result categories |
| `SuccessAnimation` | Atom | Checkmark animation for completion feedback |
| `Popover` | Molecule | Lightweight floating panel |

### Navigation (3)
`CollapsibleHeader` · `MobileDrawer` · `QuickCapture`

### Capture Modes (4)
`VoiceRecorder` · `LinkPreview` · `ScanOverlay` · `FileUpload`

### Shared Utilities (3)
`SafeView` · `ThemedText` · `ErrorBoundary`

---

## 8. Stitch Generation Prompts (Copy-Paste Ready)

Below are prompt templates you can directly paste into Google Stitch. Replace `{THEME}` with any theme name from Section 2.

### Prompt A — Dashboard (Home Tab)
```
Design a premium mobile dashboard for "Polymath OS" — a personal learning tracker.
Theme: {THEME} (surface: {SURFACE_COLOR}, primary: {PRIMARY_COLOR}).
Show: 3 stat rings (Total Activities, Connections, Journals), a bento grid of
recent activities with category chips (AI, News, Tools, Research), an AI
suggestions card, and a floating "+" FAB at bottom-right. Use strict 8pt grid,
M3 tonal surface elevation (no box-shadows in dark mode, HSL lightness ladder),
DM Sans typography with geometric scaling (1.25× ratio). Bottom tab bar with
Home/Knowledge/Mesh icons. Collapsible top header with hamburger + search.
```

### Prompt B — Neural Mesh (Graph View)
```
Design a "Neural Mesh" knowledge graph screen for a learning app.
Theme: {THEME}. Dark background with glowing primary-colored connection lines
between knowledge nodes. Each node is a rounded card showing activity title +
category chip. Lines represent AI-discovered connections. Include a floating
timeline toggle at top. 8pt spatial grid, glassmorphism for the node cards
(backdrop-filter: blur(20px), 1px white border at 10% opacity). Bottom tab
bar active on "Mesh" tab.
```

### Prompt C — Chat with Agent
```
Design a premium AI chat interface for a personal learning assistant.
Theme: {THEME}. Show: persona avatar + name + role in header, message
bubbles (user right-aligned on primaryContainer, agent left-aligned on
surfaceContainerHigh), a "memories used" indicator badge, text input bar with
send button at bottom. Use M3 typography (bodyLarge for messages, labelMedium
for timestamps). Glassmorphism input bar. 8pt spacing between messages.
```

### Prompt D — Quick Capture Bottom Sheet
```
Design a bottom sheet "Quick Capture" panel with 4 action modes as large
icon+label tiles in a 2×2 bento grid: Voice (mic icon), Link (link icon),
Scan (camera icon), File (document icon). Theme: {THEME}. Sheet uses
surfaceContainerHighest background, drag handle at top, xl border radius (28px).
Each tile uses primaryContainer background with M3 icon sizes (xl: 40px).
8pt internal padding.
```

### Prompt E — Knowledge Library
```
Design a scrollable knowledge library screen showing learning activities as
M3 cards. Each card: title (titleMedium), source chip (youtube/google/manual),
category chip with themed color, timestamp (bodySmall, 60% opacity), and
notes preview. Filter bar at top with horizontal chip scroll (All, AI, News,
Tools, Research, Tutorial). Empty state with illustration + "No activities
yet" + action button. Theme: {THEME}. 8pt grid, sm radius (8px) for chips,
xl radius (28px) for cards.
```

### Prompt F — Full App Layout Variants
```
Generate 3 layout variants with different information hierarchy for a learning
tracker mobile app called "Polymath OS":
Variant 1: Dashboard-first — stat rings dominant, bento grid below, activity
  feed at bottom.
Variant 2: Feed-first — timeline of activities as hero, stats as compact
  horizontal strip, AI suggestions as floating card.
Variant 3: Agent-first — chat interface as main view, activity feed in
  collapsible panel, stats accessible via swipe-up sheet.
All variants: {THEME} theme, 8pt grid, M3 tonal elevation, DM Sans typography,
3-tab bottom bar (Home/Knowledge/Mesh), floating "+" FAB, collapsible header.
```

---

## 9. Data Model Shapes (for Realistic Mockup Content)

### Activity
```json
{
  "id": "uuid", "title": "Building RAG with LangChain",
  "url": "https://example.com/...", "source": "youtube",
  "category": "AI", "content_type": "Video",
  "notes": "Great tutorial on retrieval augmented generation",
  "timestamp": "2026-03-22T10:30:00Z",
  "ai_analysis": { "key_topics": ["RAG", "LangChain", "Vector DB"], "learning_value": 8 }
}
```

### Journal Entry
```json
{
  "id": "uuid", "title": "Week 12 Reflection",
  "content": "This week I explored RAG architectures and...",
  "tags": ["AI", "weekly-review"], "linked_activities": ["activity-uuid"],
  "timestamp": "2026-03-21T18:00:00Z"
}
```

### Connection
```json
{
  "from_id": "activity-1", "to_id": "activity-2",
  "connection_type": "related_concept",
  "ai_reasoning": "Both explore vector embeddings for semantic search",
  "strength": 0.85
}
```

### Agent Persona
```json
{
  "name": "Nova", "role": "Polymath Guide",
  "focus_areas": ["AI", "Mathematics", "Philosophy"],
  "behavior_traits": ["Curious", "Analytical", "Supportive"],
  "custom_instructions": "Help track cross-domain learning patterns"
}
```

---

## 10. Key UX Flows to Generate Variants For

1. **First Launch** → Onboarding carousel → Register → Home (empty state with guided prompts)
2. **Quick Capture** → FAB tap → Bottom sheet → Select mode → Voice/Link/Scan/File → Auto-categorize → Return to feed with new card at top (optimistic UI)
3. **Knowledge Exploration** → Knowledge tab → Scroll activity feed → Tap card → Activity Detail → "Find Connections" → Navigate to Mesh tab to see graph
4. **Agent Interaction** → Chat screen → Ask question → Agent responds with memory-context indicator → "Train" button in Agent screen → Memory consolidation
5. **Theme Switching** → Drawer → Appearance → Swipe between 7 theme swatches → Live preview → Confirm
6. **Data Export** → Export screen → Select format chip → Download/share → Import tab → Upload JSON to restore

---

*Document generated from Polymath OS codebase analysis — March 22, 2026*
