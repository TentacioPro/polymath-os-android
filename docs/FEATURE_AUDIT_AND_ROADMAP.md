# Polymath OS — Feature Audit & Unified Roadmap

> Generated: March 2026 | Covers: Mobile (Expo), Web (Next.js), Backend (FastAPI)

---

## Part 1: Feature Map — Web vs Mobile vs Backend

### Legend
| Symbol | Meaning |
|--------|---------|
| ✅ | Fully functional with real API integration |
| 🔶 | Partial — some real data, some hardcoded/missing |
| 🧱 | UI Shell — looks functional but has zero backend wiring |
| ❌ | Not present at all |
| 🎭 | Mock — explicitly fake data pretending to be real |

---

### Dashboard

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| Total activities count | ✅ `GET /api/stats` | ✅ `useStats()` | 🔶 Fetches stats but displays as "Items/Day" (wrong label) |
| Total journals count | ✅ | ✅ | 🔶 Converts count to fake percentage labeled "Recall" |
| Total connections count | ✅ | ✅ | 🔶 Displayed as "Day Streak" (completely wrong) |
| Category distribution | ✅ | ✅ | 🔶 Hardcoded fallback `['Artificial Intel.', 14]` |
| Recent activities list | ✅ | ✅ | ✅ |
| Recent journals list | ✅ | ❌ | ✅ |
| System status indicator | ❌ No health endpoint | 🎭 Always "OPERATIONAL" + hardcoded 92% bar | ❌ |
| Neural Mesh synthesis card | ❌ | ❌ | 🎭 "Semantic overlap > 85%", "75% AI" — all fake |
| "Merge Concepts" button | ❌ | ❌ | 🧱 `onPress={() => {}}` — dead |

### Knowledge / Activities

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| List activities | ✅ `GET /api/activities` | ✅ Full list with filters | ✅ 3-column grid |
| Create activity (manual) | ✅ `POST /api/activities/manual` | ✅ Modal form | ❌ Not wired |
| File upload (JSON) | ✅ `POST /api/activities/upload` | ✅ Drag-and-drop | ❌ Not wired |
| Delete activity | ✅ `DELETE /api/activities/{id}` | ✅ | ❌ Not wired |
| Search activities | ❌ No search endpoint | ❌ | 🧱 Search icon exists, no handler |
| Filter by type | ❌ Backend-side | ✅ Client-side | ✅ Client-side filter chips |
| Activity detail view | ❌ No detail endpoint | ❌ | ❌ Tap does nothing |

### Journaling

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| List journals | ✅ `GET /api/journals` | ✅ | ❌ Screen deleted in revamp |
| Create journal | ✅ `POST /api/journals` | ✅ Modal form | ❌ |
| Edit journal | ✅ `PUT /api/journals/{id}` | ❌ API exists, no UI | ❌ |
| Delete journal | ✅ `DELETE /api/journals/{id}` | ✅ | ❌ |

### Knowledge Connections / Neural Mesh

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| List connections | ✅ `GET /api/connections` | ✅ | ✅ |
| Generate connections | ✅ `POST /api/ai/generate-connections/{id}` | ✅ Button per activity | ❌ Not wired |
| AI suggestions | ✅ `GET /api/ai/suggestions` | ✅ Tab with generate button | ❌ Not wired |
| Visual graph | ❌ No graph layout engine | 🧱 "Graph" tab is a flat card list | 🔶 SVG nodes at random positions, no interactivity |
| Timeline view | ❌ | ✅ Connection list | ❌ |

### Agent System

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| List memories | ✅ `GET /api/agent/memory` | ✅ Full CRUD | 🧱 Shows 4 static "capabilities" |
| Create/delete memory | ✅ | ✅ | ❌ |
| Learn from data | ✅ `POST /api/agent/learn` | ✅ Button | ❌ |
| Consolidate memories | ✅ `POST /api/agent/consolidate` | ✅ Button | ❌ |
| View/edit persona | ✅ `GET/PUT /api/agent/persona` | ✅ Full editor | ❌ |
| Learning logs | ✅ `GET /api/agent/learning-logs` | ✅ Timeline | ❌ |
| Agent stats | ✅ `GET /api/agent/stats` | ✅ Stats cards | ❌ |
| Agent capabilities display | ❌ UI-only concept | ❌ | 🧱 Static list, no handlers |

### Chat

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| Send message to AI | ✅ `GET /api/agent/chat?message=` | ✅ Real OpenAI response | 🎭 Fake `setTimeout` response |
| Chat sessions | ❌ No persistence endpoint | 🔶 localStorage only | ❌ |
| Suggested prompts | ❌ | ✅ 6 static prompts (UX choice) | ❌ |
| Persona display | ✅ | ✅ Shows agent name/role | ❌ |
| Message history | ❌ | 🔶 localStorage only | ❌ Single session, lost on close |

### Export & Import

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| Export JSON | ✅ `POST /api/export/json` | ✅ Downloads file | 🧱 Triggers Share.share() with static text |
| Export Markdown | ✅ `POST /api/export/markdown` | ✅ Downloads file | 🧱 Not wired |
| Export CSV | ✅ `POST /api/export/csv` | ✅ Downloads file | 🧱 Not wired |
| Export PDF | ✅ Backend ready | ❌ No UI | 🧱 Listed but not wired |
| Export PPT | ✅ Backend ready | ❌ No UI | 🧱 Listed but not wired |
| Import/Restore | ✅ `POST /api/import/restore` | ✅ File picker + restore | ❌ Not wired |
| Format selection | ✅ | ✅ Cards per format | 🧱 Selection tracked but ignored |

### Alerts / Notifications

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| Alert list | ❌ No endpoint | ❌ | 🎭 `MOCK_ALERTS` — 3 fake alerts |
| Dismiss/manage alerts | ❌ | ❌ | ❌ |
| Real-time notifications | ❌ | ❌ | ❌ |

### Analytics

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| Ingestion stats | ✅ via `/api/stats` | ✅ On dashboard | 🧱 All values show "—" |
| Connection stats | ✅ via `/api/stats` | ✅ On dashboard | 🧱 |
| Charts/graphs | ❌ | ❌ | 🧱 Placeholder text only |
| Learning timeline | ❌ | ❌ | 🧱 Placeholder text only |

### Integrations

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| External service list | ❌ No endpoints | ❌ | 🧱 5 hardcoded services (Notion, Readwise, GitHub, Podcast, Pocket) |
| OAuth / API key mgmt | ❌ | ❌ | ❌ |
| Connection status | ❌ | ❌ | 🎭 Notion always shows "LINKED" |

### Profile / Settings

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| User profile | ❌ No auth system | ❌ No page | 🧱 Hardcoded "Polymath User" |
| Theme switching | ❌ Client-side only | ✅ 3 themes + persistence | ✅ 3 themes + persistence |
| Data & Storage settings | ❌ | ❌ | 🧱 Button does nothing |
| Sync settings | ❌ | ❌ | 🧱 Button does nothing |

### Navigation & Shell

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| Main navigation | — | ✅ Sidebar + Bottom nav + Drawer | ✅ Floating pill + Drawer |
| Theme switcher in nav | — | ✅ AppSidebar + Drawer | ✅ AppDrawer + Profile |
| System status in nav | ❌ | 🎭 Always "Connected" (fake) | 🎭 Always "Online"/"Stable" (fake) |
| Search | ❌ | ❌ | 🧱 Drawer search button — dead |
| Quick capture | ❌ No endpoint | ❌ | 🧱 Text goes nowhere, action buttons dead |

---

## Part 2: What's Hardcoded (Full List)

### Mobile App — Hardcoded/Mock Data

| Screen | Item | What It Shows | Reality |
|--------|------|---------------|---------|
| Dashboard | Stat "Items/Day" | `stats.total_activities` | Wrong label — it's total count, not daily rate |
| Dashboard | Stat "Recall" | `Math.min(journals, 100) + '%'` | Fake percentage from a count |
| Dashboard | Stat "Day Streak" | `stats.total_connections` | Wrong label — it's connection count |
| Dashboard | "Semantic overlap > 85%" | Static text | No computation, pure decoration |
| Dashboard | Circle chart "75% AI" | Static SVG | No data behind it |
| Dashboard | Fallback topics | `['Artificial Intel.', 14]...` | Shows when no real categories |
| Neural Mesh | 5 fallback nodes | `'Deep Structure'`, `'Ingestion'`... | Shows when no connections |
| Neural Mesh | Node positions | `Math.random()` x/y | Randomized on every render |
| Agent | Capabilities list | 4 static items | No backend mapping |
| Agent | "ACTIVE" badge | Always shown | No health check |
| Chat | Initial message | `'Hello. I am your Polymath agent...'` | Static string |
| Chat | Bot response | `'Processing your request...'` via setTimeout | **Fake AI** — real endpoint exists but unused |
| Export | Share text | `'Polymath OS Export — Deep Structure...'` | Static — no real export data |
| Alerts | 3 alerts | `MOCK_ALERTS` array | Explicitly named mock |
| Analytics | All stats | `"—"` (em-dash) | No API calls |
| Integrations | 5 services | Notion "connected", others "available" | All fake status |
| Profile | Username | `"Polymath User"` | No auth |
| Profile | Version | `"Deep Structure v1.0"` | Static |
| AppDrawer | Status | `"Online"` / `"Stable"` | No health check |
| QuickCapture | Target path | `'Target: /Inbox/Unsorted'` | No inbox system |

### Web App — Hardcoded/Mock Data

| Page | Item | What It Shows | Reality |
|------|------|---------------|---------|
| Dashboard | System status | `"OPERATIONAL"` | No health endpoint |
| Dashboard | Progress bar | `width: '92%'` | Always 92%, not computed |
| AppSidebar | Connection status | Green dot + "Connected" | No connectivity check |
| BottomNav | "Profile" label | Links to `/export` | Mislabeled nav item |
| Drawer | "Agent Chat" action | Links to `/agent` not `/chat` | Wrong destination |
| Drawer | Nav links | Missing `/chat` route | Inconsistent with sidebar |

---

## Part 3: Unified Roadmap

### Phase 0: Critical Fixes (1-2 days)
> Fix broken/misleading things. No new features.

| # | Task | Platform | Type | Effort |
|---|------|----------|------|--------|
| 0.1 | Fix Dashboard stat labels — show real labels ("Total Activities", "Total Journals", "Total Connections") instead of fake "Items/Day", "Recall %", "Day Streak" | Mobile | Bug | 30min |
| 0.2 | Remove hardcoded "Semantic overlap > 85%" and static circle chart, or wire to real data | Mobile | Bug | 30min |
| 0.3 | Wire Chat to real `GET /api/agent/chat` endpoint (replace setTimeout mock) | Mobile | Bug | 1hr |
| 0.4 | Wire Export to real backend endpoints (`/api/export/json`, `/markdown`, `/csv`) | Mobile | Bug | 1hr |
| 0.5 | Fix BottomNav "Profile" → `/export` mislabel (rename to "Export" or add `/profile` page) | Web | Bug | 15min |
| 0.6 | Fix Drawer — add `/chat` to nav links, fix "Agent Chat" → `/chat` link | Web | Bug | 15min |
| 0.7 | Remove fake "OPERATIONAL" / "Connected" / "Online" status indicators (or add real `/api/health` endpoint) | Both | Bug | 1hr |
| 0.8 | Wire Analytics screen to real `GET /api/stats` + `GET /api/agent/stats` | Mobile | Bug | 1hr |

### Phase 1: Parity — Wire Mobile to Backend (3-5 days)
> Make the mobile app actually functional. Backend APIs already exist.

| # | Task | Platform | Backend Change | Effort |
|---|------|----------|----------------|--------|
| 1.1 | Wire Knowledge screen: add manual entry form → `POST /api/activities/manual` | Mobile | None | 2hr |
| 1.2 | Wire Knowledge screen: file upload → `POST /api/activities/upload` | Mobile | None | 2hr |
| 1.3 | Wire Knowledge screen: delete → `DELETE /api/activities/{id}` | Mobile | None | 1hr |
| 1.4 | Wire Neural Mesh: generate connections button → `POST /api/ai/generate-connections/{id}` | Mobile | None | 1hr |
| 1.5 | Wire Neural Mesh: AI suggestions → `GET /api/ai/suggestions` | Mobile | None | 1hr |
| 1.6 | Wire Agent screen to real endpoints: memory list, learn, consolidate, persona, stats | Mobile | None | 3hr |
| 1.7 | Wire QuickCapture submit → `POST /api/activities/manual` | Mobile | None | 1hr |
| 1.8 | Wire Import/Restore in Export screen → `POST /api/import/restore` | Mobile | None | 1hr |
| 1.9 | Add Journal screen back (was deleted in revamp) — or merge into Knowledge | Mobile | None | 2hr |

### Phase 2: Missing Core Features (1-2 weeks)
> Features that users expect but nobody has built yet.

| # | Task | Platform | Backend Change | Effort |
|---|------|----------|----------------|--------|
| 2.1 | Activity detail view (tap → full details + AI analysis) | Both | Add `GET /api/activities/{id}` | 4hr |
| 2.2 | Journal edit UI (web already has API, just needs button + modal) | Web | None | 2hr |
| 2.3 | Journal screen for mobile (create, list, edit, delete) | Mobile | None | 4hr |
| 2.4 | Search — full-text across activities + journals | Both | Add `GET /api/search?q=` | 6hr |
| 2.5 | Real graph visualization (D3 force-directed / react-native-graph) | Both | None | 12hr |
| 2.6 | Backend health endpoint (`GET /api/health`) for real status indicators | Both | Add endpoint | 1hr |
| 2.7 | Chat history persistence (backend-side, not just localStorage) | Both | Add `POST /api/agent/chat/sessions` | 4hr |
| 2.8 | PDF export UI (backend already supports it) | Both | None | 2hr |

### Phase 3: New Capabilities (2-4 weeks)
> Expand beyond what exists today.

| # | Task | Platform | Backend Change | Effort |
|---|------|----------|----------------|--------|
| 3.1 | Real notification system (WebSocket / polling for alerts) | Both | Add `GET /api/notifications`, WebSocket | 8hr |
| 3.2 | Integrations framework (OAuth connectors for Notion, GitHub, etc.) | Both | Add `/api/integrations/*` | 20hr |
| 3.3 | User authentication (email/password or OAuth) | Both | Add auth middleware | 12hr |
| 3.4 | Analytics dashboard with real charts (learning trends, heatmap, domains) | Both | Add `/api/analytics/*` | 10hr |
| 3.5 | QuickCapture action buttons: Voice (speech-to-text), Link (URL extraction), File (upload) | Mobile | None | 6hr |
| 3.6 | Image export with "Abishek M" watermark | Mobile | Backend ready | 4hr |
| 3.7 | Offline mode + sync queue | Mobile | Add sync endpoints | 20hr |
| 3.8 | Real-time YouTube/Google API sync | Both | Add OAuth + sync | 25hr |

### Phase 4: Polish & Production (2-4 weeks)
> Get ready for app store submission.

| # | Task | Platform | Effort |
|---|------|----------|--------|
| 4.1 | Error boundaries + graceful degradation on all screens | Both | 4hr |
| 4.2 | Pull-to-refresh on all list screens | Mobile | 2hr |
| 4.3 | Skeleton loading states (replace spinners) | Both | 4hr |
| 4.4 | Unit tests for API hooks + critical flows | Both | 8hr |
| 4.5 | E2E tests (Detox for mobile, Playwright for web) | Both | 12hr |
| 4.6 | App icon, splash screen, adaptive icon | Mobile | 2hr |
| 4.7 | EAS Build + App Store / Play Store submission | Mobile | 8hr |
| 4.8 | Production backend deployment (Railway/Fly.io + MongoDB Atlas) | Backend | 4hr |
| 4.9 | Environment-based config (dev/staging/prod) | All | 2hr |

---

## Part 4: Scoreboard

### Current State

| Metric | Web | Mobile |
|--------|-----|--------|
| Screens/Pages | 7 | 10 |
| Real API calls | **24 endpoints wired** | **3 endpoints wired** |
| Mock/hardcoded items | 4 minor | **20+ items** |
| Shell screens (no logic) | 0 | **7 out of 10** |
| Backend endpoints available | 31 | 31 |
| Backend endpoints **actually used** | 24 (77%) | 3 (10%) |

### Functional Reality

| Feature Area | Web | Mobile |
|-------------|-----|--------|
| CRUD Activities | ✅ Full | ❌ Read-only |
| CRUD Journals | ✅ Create + Delete | ❌ Not present |
| Connections + AI | ✅ Full | ❌ Read-only |
| Agent Memory System | ✅ Full (8 endpoints) | ❌ Static shell |
| Chat with AI | ✅ Real OpenAI | ❌ Fake setTimeout |
| Export | ✅ 3 formats + import | ❌ Triggers blank Share |
| Analytics | 🔶 On dashboard | ❌ All "—" |
| Integrations | ❌ | ❌ Fake list |
| Profile/Settings | 🔶 Theme only | 🔶 Theme only |

### Bottom Line

**The web app is 77% functional** — it wires 24 of 31 backend endpoints and provides real CRUD for all major features.

**The mobile app is 10% functional** — it only reads data from 3 endpoints. The UI revamp created beautiful screens but broke or never wired the backend integration. 7 out of 10 screens are pure visual shells with zero functionality.

**Priority: Phase 0 + Phase 1 will bring mobile from 10% → 70% functional with no backend changes needed. All the APIs already exist.**
