# Polymath OS — Feature Audit & Unified Roadmap

> Updated: March 21, 2026 | Covers: Mobile (Expo), Web (Next.js), Backend (FastAPI)
> Previous audit (March 15, 2026) — V4 UI revamp (9 phases) complete on both platforms.
> **For latest status**: `qoder-agent-docs/01_PROJECT_STATUS_ANALYSIS.md`

---

## Part 1: Feature Map — Web vs Mobile vs Backend

### Legend
| Symbol | Meaning |
|--------|---------|
| ✅ | Fully functional with real API integration |
| 🔶 | Partial — mostly real, minor gaps |
| ❌ | Not present at all |

---

### Dashboard

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| Total activities count | ✅ `GET /api/stats` | ✅ `useStats()` | ✅ Real labels from API |
| Total journals count | ✅ | ✅ | ✅ Real count from API |
| Total connections count | ✅ | ✅ | ✅ Real count from API |
| Category distribution | ✅ | ✅ | ✅ From API (cosmetic fallback when empty) |
| Recent activities list | ✅ | ✅ | ✅ |
| Recent journals list | ✅ | ❌ | ✅ |
| Quick actions (Add, Chat, Search, Journal) | ✅ | ✅ New + Chat buttons | ✅ All 4 route correctly |
| Pull-to-refresh | — | ✅ Refresh button | ✅ Pull-to-refresh |

### Knowledge / Activities

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| List activities | ✅ `GET /api/activities` | ✅ Full list + filters | ✅ List with filter chips |
| Create activity (manual) | ✅ `POST /api/activities/manual` | ✅ Modal form | ✅ Modal form |
| File upload (JSON) | ✅ `POST /api/activities/upload` | ✅ Drag-and-drop | ❌ Not available |
| Delete activity | ✅ `DELETE /api/activities/{id}` | ✅ Popover menu | ✅ Long-press Popover |
| **Rename activity** | ✅ `PATCH /api/activities/{id}` (V4) | ✅ Inline rename (V4 Phase 7) | ✅ Bottom sheet rename (V4 Phase 7) |
| Activity detail view | ✅ `GET /api/activities/{id}` | ✅ Full detail page | ✅ Full detail + AI analysis |
| Search activities | ✅ `GET /api/search` | ✅ `/search` page | ✅ Full-text search |
| Filter by type | ✅ (client-side) | ✅ Client-side | ✅ Client-side filter chips |
| **Empty state** | — | ✅ EmptyState component (V4 Phase 6) | ✅ EmptyState component (V4 Phase 6) |

### Journaling

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| List journals | ✅ `GET /api/journals` | ✅ | ✅ |
| Create journal | ✅ `POST /api/journals` | ✅ Modal form | ✅ Modal form |
| Edit journal | ✅ `PUT /api/journals/{id}` | ✅ Edit modal | ✅ Tap to edit |
| Delete journal | ✅ `DELETE /api/journals/{id}` | ✅ | ✅ Long-press delete |

### Knowledge Connections / Neural Mesh

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| List connections | ✅ `GET /api/connections` | ✅ | ✅ |
| Generate connections | ✅ `POST /api/ai/generate-connections/{id}` | ✅ Button per activity | ✅ Wired |
| AI suggestions | ✅ `GET /api/ai/suggestions` | ✅ Tab with generate button | ✅ Wired |
| Visual graph | ❌ | ✅ Force-directed interactive graph (D3) | 🔶 SVG placeholder nodes when empty |
| Timeline view | ❌ | ✅ Connection list | ✅ Connection list |

### Agent System

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| List memories | ✅ `GET /api/agent/memory` | ✅ Full CRUD | ✅ Read + stats |
| Create/delete memory | ✅ | ✅ | ❌ Read-only |
| Learn from data | ✅ `POST /api/agent/learn` | ✅ Button | ✅ Button |
| Consolidate memories | ✅ `POST /api/agent/consolidate` | ✅ Button | ✅ Button |
| View/edit persona | ✅ `GET/PUT /api/agent/persona` | ✅ Full editor | 🔶 Display only (no edit UI) |
| Learning logs | ✅ `GET /api/agent/learning-logs` | ✅ Timeline | ❌ |
| Agent stats | ✅ `GET /api/agent/stats` | ✅ Stats cards | ✅ Stats cards |

### Chat

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| Send message to AI | ✅ `GET /api/agent/chat?message=` | ✅ Real OpenAI response | ✅ Real OpenAI response |
| Chat sessions | ❌ No persistence endpoint | 🔶 localStorage only | ❌ Single session |
| Suggested prompts | ❌ | ✅ 6 static prompts (UX) | ❌ |
| Persona display | ✅ | ✅ Shows agent name/role | ❌ |
| Message history | ❌ | 🔶 localStorage only | ❌ Lost on close |

### Export & Import

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| Export JSON | ✅ `POST /api/export/json` | ✅ Downloads file | ✅ Share sheet with real data |
| Export Markdown | ✅ `POST /api/export/markdown` | ✅ Downloads file | ✅ Share sheet with real data |
| Export CSV | ✅ `POST /api/export/csv` | ✅ Downloads file | ✅ Share sheet with real data |
| Import/Restore | ✅ `POST /api/import/restore` | ✅ File picker + restore | ✅ DocumentPicker + restore |

### Alerts / Notifications

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| Alert list | ✅ `GET /api/notifications` | ✅ `/alerts` page (V4) | ✅ Wired to API |
| Dismiss/manage alerts | ❌ | ❌ | 🔶 Alert tap has no action |
| Real-time notifications | ❌ | ❌ | ❌ |

### Analytics

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| Ingestion stats | ✅ via `/api/stats` | ✅ On dashboard | ✅ Dedicated analytics screen |
| Agent stats | ✅ via `/api/agent/stats` | ✅ On dashboard | ✅ Dedicated analytics screen |
| System health | ✅ `GET /api/health` | ✅ Real health check (V4) | ✅ Real health check |

### Integrations / AI Config

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| AI config (API key + model) | ✅ `GET/POST /api/ai-config` | ✅ `/integrations` page | ✅ Config modal |
| System health display | ✅ `GET /api/health` | ✅ | ✅ Health view |

### Profile / Settings

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| User profile display | ✅ `GET /api/agent/persona` | ✅ `/profile` page (V4) | ✅ Persona name/role from API |
| Theme switching | ❌ Client-side only | ✅ 7 themes + persistence (V4) | ✅ 7 themes + persistence |
| Appearance page | — | ✅ `/appearance` dedicated page (V4) | ✅ Dedicated page with 7 theme previews |
| Customize / Personalization | — | ✅ `/customize` page | ✅ Dashboard layout, sidebar position, screen toggles |

### Navigation & Shell

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| Main navigation | — | ✅ Sidebar + Bottom nav + Drawer | ✅ Floating pill + Drawer |
| Theme switcher in nav | — | ✅ AppSidebar + Drawer | ✅ AppDrawer + Appearance screen |
| System status indicator | ✅ | 🔶 Cosmetic "LIVE" dot (not wired) | ✅ Real via `/api/health` |
| Search | ✅ `GET /api/search` | ❌ | ✅ Full search page |
| Quick capture | ✅ `POST /api/activities/manual` | ❌ "+" just navigates | ✅ Bottom sheet, wired to API |

---

## Part 2: What's Hardcoded (Full List)

### Mobile App — Remaining Hardcoded/Minor Items

| Screen | Item | What It Shows | Reality |
|--------|------|---------------|---------|
| Neural Mesh | 5 placeholder nodes | `'Deep Structure'`, `'Ingestion'`... | Cosmetic fallback when zero connections |
| Agent | Capabilities list | 4 static items (Synthesize, Deep Analysis, etc.) | UI metadata — each maps to real API actions |
| Chat | Initial greeting | `'Hello. I am your Polymath agent...'` | Static seed message (real responses after) |
| Profile | Fallback name | `"Polymath User"` | Default when API returns no persona |
| Profile | Fallback version | `"Polymath OS v1.0"` | Static |
| QuickCapture | Voice/Scan/File buttons | Voice: "Coming soon", Scan/File: functional | Scan + File implemented, Voice permission-ready |
| Customize | All preferences | Layout options, toggles | Client-only, **not persisted** across restarts |
| Appearance | Theme metadata | 7 themes with swatch colors | Design tokens (intentional) |

### Web App — Remaining Hardcoded/Mock Data

| Page | Item | What It Shows | Reality |
|------|------|---------------|---------|
| TopHeader | "LIVE" indicator | Pulsing accent dot + "LIVE" text | No health check — purely cosmetic |
| AppSidebar | Status dot | Accent color dot + "Polymath OS" | No connectivity check |
| Chat | Suggested prompts | 6 preset prompt buttons | UX convenience — responses are real |
| Chat | Session history | localStorage-persisted sessions | No backend persistence |
| AppSidebar | "System // v1" | Static text | Version label |

---

## Part 3: Updated Roadmap

### ~~Phase 0: Critical Fixes~~ ✅ COMPLETED
> All Phase 0 items were resolved during the mobile revamp.

### ~~Phase 1: Wire Mobile to Backend~~ ✅ COMPLETED
> Mobile now wires ~27 of 35 backend endpoints. All major CRUD operations functional.

### Phase 2: Web Parity with Mobile (✅ MOSTLY COMPLETE)
> Web parity achieved on 2026-03-15. Remaining: polish items.

| # | Task | Platform | Backend Change | Status |
|---|------|----------|----------------|--------|
| 2.1 | Add all 7 themes to web (Ocean, Forest, Sunset, Midnight missing) | Web | None | ⏳ 4 missing |
| 2.2 | Match web design system to mobile tokens (spacing, shadows, typography) | Web | None | ⏳ Partial |
| 2.3 | Add Activity detail page | Web | None | ⏳ Pending |
| 2.4 | Add Search page | Web | None | ⏳ Pending |
| 2.5 | Add Analytics page | Web | None | ⏳ Pending |
| 2.6 | Add Alerts/Notifications page | Web | None | ⏳ Pending |
| 2.7 | Add Profile/Settings page | Web | None | ⏳ Pending |
| 2.8 | Add Integrations/AI Config page | Web | None | ✅ Done |
| 2.9 | Add Journal edit UI | Web | None | ⏳ Pending |
| 2.10 | Wire TopHeader "LIVE" to real `/api/health` | Web | None | ⏳ Pending |
| 2.11 | Add Quick Capture modal (instead of just navigating) | Web | None | ⏳ Pending |
| 2.12 | Add Appearance page with all 7 theme previews | Web | None | ⏳ Pending |
| 2.13 | Add Customize/Personalization page | Web | None | ✅ Done |
| 2.14 | File upload on mobile (Activities) | Mobile | None | ✅ Done |
| 2.15 | Agent memory create/delete on mobile | Mobile | None | ⏳ Pending |
| 2.16 | Persona edit UI on mobile | Mobile | None | ⏳ Pending |
| 2.17 | Chat session persistence on mobile | Mobile | None | ⏳ Pending |

### Phase 3: New Capabilities (2-4 weeks)

| # | Task | Platform | Backend Change | Status |
|---|------|----------|----------------|--------|
| 3.1 | Real notification system (WebSocket / polling) | Both | WebSocket endpoint | ⏳ Pending |
| 3.2 | Integrations framework (OAuth for Notion, GitHub, etc.) | Both | Add `/api/integrations/*` | ⏳ Pending |
| 3.3 | User authentication | Both | Add auth middleware | ⏳ Pending |
| 3.4 | Advanced analytics with charts (trends, heatmap) | Both | Add `/api/analytics/*` | ⏳ Pending |
| 3.5 | QuickCapture: Voice action | Mobile | None | ⏳ Pending (Scan/File done) |
| 3.6 | Offline mode + sync queue | Mobile | Add sync endpoints | ⏳ Pending |
| 3.7 | Real graph visualization (D3/force-directed) | Both | None | ✅ Done (web) |
| 3.8 | Backend-persisted chat history | Both | Add session endpoints | ⏳ Pending |
| 3.9 | Mobile Sentry runtime integration | Mobile | None | ✅ Done |
| 3.10 | Security hardening (CORS/rate-limit/auth) | Backend | Middleware added | ✅ Done |
| 3.11 | Product analytics event taxonomy | Both | None | ✅ Done |

### Phase 4: Polish & Production (2-4 weeks)

| # | Task | Platform | Effort |
|---|------|----------|--------|
| 4.1 | Error boundaries + graceful degradation | Both | 4hr |
| 4.2 | Skeleton loading states | Both | 4hr |
| 4.3 | Unit tests for hooks + critical flows | Both | 8hr |
| 4.4 | E2E tests (Playwright for web, Detox for mobile) | Both | 12hr |
| 4.5 | App icon, splash screen, adaptive icon | Mobile | 2hr |
| 4.6 | Production deployment | Backend | 4hr |
| 4.7 | Environment-based config (dev/staging/prod) | All | 2hr |
| 4.8 | Zustand persistence middleware (mobile) | Mobile | 1hr |

---

## Part 4: Scoreboard

### Current State (March 15, 2026)

| Metric | Web | Mobile |
|--------|-----|--------|
| Screens/Pages | **9** (incl. /integrations, /customize) | **15** |
| Backend endpoints wired | ~25 unique | **~27 unique** |
| Mock/hardcoded items | 2 cosmetic | ~3 minor (fallbacks/stubs) |
| Shell screens (no logic) | 0 | **0** |
| Backend endpoints available | 35 | 35 |
| Backend endpoints used | **~71%** | **~77%** |

### Functional Reality

| Feature Area | Web | Mobile |
|-------------|-----|--------|
| CRUD Activities | ✅ Full (no detail view) | ✅ Full + detail view |
| CRUD Journals | ✅ Create + Delete (no edit) | ✅ Full CRUD |
| Connections + AI | ✅ Full + interactive graph | ✅ Full |
| Agent Memory System | ✅ Full (8 endpoints) | ✅ Read + Learn + Consolidate |
| Chat with AI | ✅ Real + sessions | ✅ Real (no sessions) |
| Export/Import | ✅ 3 formats + import | ✅ 3 formats + import |
| Search | ❌ | ✅ Full-text |
| Analytics | 🔶 On dashboard | ✅ Dedicated page |
| Alerts/Notifications | ❌ | ✅ Wired |
| AI Config | ✅ Integrations page | ✅ Config modal |
| Profile/Settings | 🔶 Theme only | ✅ Full profile page |
| Personalization | ✅ Customize page | ✅ Customize page |

### Bottom Line

**The mobile app is ~77% functional** on 35 backend endpoints. Full feature coverage with agent memory, search, analytics, and quick capture.

**The web app is ~71% functional** (up from 57%). Now has /integrations, /customize, and interactive force-directed graph. Remaining gaps: search, activity detail, alerts, analytics pages.

**Backend is production-hardened** with environment-aware CORS, rate limiting, API key auth, and security headers.

**Priority: Remaining Phase 2 polish items + smoke tests + production deployment validation.**
