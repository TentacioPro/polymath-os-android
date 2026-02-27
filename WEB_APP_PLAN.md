# Polymath OS — Web App Plan

> Architecture plan for a **web companion app** that mirrors the mobile app pixel-for-pixel, shares the same backend/data, and supports seamless cross-device continuity.

---

## Table of Contents

1. [Goal](#1-goal)
2. [Architecture Decision — Why Next.js](#2-architecture-decision--why-nextjs)
3. [System Architecture](#3-system-architecture)
4. [Shared Data Layer — How Cross-Device Sync Works](#4-shared-data-layer--how-cross-device-sync-works)
5. [Feature Parity Matrix](#5-feature-parity-matrix)
6. [UI/Theme System — Exact Style Match](#6-uitheme-system--exact-style-match)
7. [Shared Code Strategy](#7-shared-code-strategy)
8. [Implementation Plan (Phases)](#8-implementation-plan-phases)
9. [File Structure](#9-file-structure)
10. [Technology Stack](#10-technology-stack)
11. [Alternative: Expo Web (and why not)](#11-alternative-expo-web-and-why-not)

---

## 1. Goal

- **Exact same styling** as the mobile app (dark theme, same colors, same layout density)
- **Same data** — all reads/writes go through the same FastAPI backend + MongoDB
- **Pick up where you left off** — open the web app and see the exact state you last touched on mobile (and vice versa)
- **Feature-complete** — every tab from the mobile app has a web equivalent
- **No additional backend changes required** — the existing API is already REST and sufficient

---

## 2. Architecture Decision — Why Next.js

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Next.js (App Router)** | File-based routing (familiar from expo-router), SSR/SSG for fast loads, React 19 support, Tailwind CSS built-in, easy deployment (Vercel/self-host) | Separate codebase from RN | **Winner** |
| **Expo Web** (`npx expo start --web`) | Zero new code — RN components render to web | Poor web UX (mobile-first abstractions), no real CSS, bad SEO, slow, limited web APIs | Not recommended |
| **Vite + React** | Lightweight, fast HMR | No SSR, manual routing setup | Runner-up |
| **React Native Web** standalone | Shares RN components | Still awkward for web, limited ecosystem | Not recommended |

**Next.js wins** because:
- You already know React — Next.js is just React with file-based routing (same mental model as expo-router)
- Tailwind CSS makes it trivial to match the exact mobile color palette
- The backend API is already REST — Next.js just calls the same endpoints
- Vercel deployment is one click
- App Router uses the same concepts: layouts, pages, loading states

---

## 3. System Architecture

```
┌─────────────────────────────────────┐
│            MongoDB                  │
│  (single source of truth)           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        FastAPI Backend              │
│   http://localhost:8001/api/*       │
│   (unchanged — serves both apps)   │
└──────┬───────────────────┬──────────┘
       │                   │
┌──────▼───────┐   ┌───────▼─────────┐
│  Expo Go     │   │  Next.js Web    │
│  (Mobile)    │   │  (Browser)      │
│  :8081       │   │  :3000          │
│              │   │                 │
│  Zustand +   │   │  TanStack      │
│  Axios       │   │  Query + Axios  │
└──────────────┘   └─────────────────┘
```

**Key insight:** Both clients hit the **same API endpoints** on the **same MongoDB**. There is no sync protocol needed — the database IS the sync layer. When you add an activity on mobile, refreshing the web app shows it immediately (and vice versa).

---

## 4. Shared Data Layer — How Cross-Device Sync Works

### The "Pick Up Where I Left Off" Problem

The mobile app currently uses:
- **Zustand** for in-memory UI state (activities, journals list)
- **API calls** to fetch fresh data on every screen mount (`useEffect → axios.get`)
- **No local-first / offline cache** (all data lives in MongoDB)

This is actually ideal for cross-device sync. There's nothing to "sync" — both apps always read from the same database.

### Ensuring Real-Time Freshness

To make the experience seamless (open web → see what you just did on mobile), the web app should use **TanStack Query** (React Query) with:

```typescript
// Stale-while-revalidate: show cached data instantly, refetch in background
const { data: activities } = useQuery({
  queryKey: ['activities'],
  queryFn: () => axios.get(`${API_URL}/api/activities?limit=100`).then(r => r.data),
  staleTime: 5_000,        // consider fresh for 5 seconds
  refetchOnWindowFocus: true, // refetch when user switches back to tab
});
```

This means:
1. You use the mobile app → add an activity → close Expo Go
2. You open the web app → TanStack Query fetches from the API → shows the new activity immediately
3. If you had the web tab open already → switching to it triggers `refetchOnWindowFocus` → fresh data in <1s

### Optional: Real-Time Push (Phase 2 Enhancement)

If you want instant push updates (not just on focus), add WebSocket support later:

```python
# backend/server.py — add a simple SSE or WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    # Broadcast data changes to all connected web clients
```

But this is a nice-to-have. The refetch-on-focus pattern covers 95% of use cases.

---

## 5. Feature Parity Matrix

Every mobile tab maps to a web page:

| Mobile Tab | Web Route | Components | Web-Specific Adaptations |
|-----------|-----------|------------|--------------------------|
| **Dashboard** (`index.tsx`) | `/` | Stats grid, recent activities, category chips | Wider layout — 3-col stats become a row, activity cards get more horizontal space |
| **Activities** (`activities.tsx`) | `/activities` | Activity list, add modal, file upload | Native file input instead of `expo-document-picker`, drag-and-drop zone for JSON files |
| **Journal** (`journal.tsx`) | `/journal` | Journal cards, create modal with rich text | Can use a proper rich text editor (e.g., Tiptap) instead of plain TextInput |
| **Connections** (`connections.tsx`) | `/connections` | Timeline, graph, AI suggestions | Can use a real graph visualization lib (e.g., D3.js, react-force-graph) instead of the simplified list view |
| **Export** (`export.tsx`) | `/export` | Export buttons, import restore | Browser native download (no `expo-file-system`/`expo-sharing` needed), drag-and-drop import |
| **Agent** (`agent.tsx`) | `/agent` | Memory list, persona editor, chat | Chat can be a proper chat UI with message history, markdown rendering |

### Web-Only Enhancements (Optional Phase 2+)

- **Keyboard shortcuts** (Cmd+N for new activity, Cmd+K for search)
- **Command palette** (search across activities, journals, memories)
- **Split-pane views** (activity detail + connections side by side)
- **Real graph visualization** for the connections tab using D3/force-graph
- **Rich text journal editor** with markdown preview

---

## 6. UI/Theme System — Exact Style Match

The mobile app uses a consistent dark theme. Here's the exact Tailwind config to replicate it:

### Color Palette (extracted from mobile `StyleSheet`)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Base backgrounds
        'poly-bg': '#0f172a',        // main background (slate-900)
        'poly-card': '#1e293b',      // card/header background (slate-800)
        'poly-border': '#334155',    // borders (slate-700)
        'poly-input': '#374151',     // input fields (gray-700)

        // Text
        'poly-text': '#ffffff',      // primary text
        'poly-muted': '#94a3b8',     // secondary text (slate-400)
        'poly-dim': '#64748b',       // tertiary text (slate-500)

        // Accents
        'poly-indigo': '#6366f1',    // primary accent (indigo-500)
        'poly-green': '#10b981',     // success/secondary accent (emerald-500)
        'poly-amber': '#f59e0b',     // warning/tertiary accent (amber-500)
        'poly-pink': '#ec4899',      // destructive/chat accent (pink-500)
        'poly-blue': '#3b82f6',      // info accent (blue-500)
        'poly-purple': '#8b5cf6',    // AI category (violet-500)
        'poly-cyan': '#06b6d4',      // tutorial category (cyan-500)

        // Category colors (for badges)
        'cat-ai': '#8b5cf6',
        'cat-news': '#3b82f6',
        'cat-tools': '#10b981',
        'cat-market': '#f59e0b',
        'cat-research': '#ec4899',
        'cat-tutorial': '#06b6d4',
        'cat-other': '#6b7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
```

### Component Token Mapping

| Mobile (`StyleSheet`) | Web (Tailwind classes) |
|---|---|
| `backgroundColor: '#0f172a'` | `bg-poly-bg` |
| `backgroundColor: '#1e293b'` | `bg-poly-card` |
| `borderColor: '#334155'` | `border-poly-border` |
| `color: '#fff'` | `text-poly-text` |
| `color: '#94a3b8'` | `text-poly-muted` |
| `backgroundColor: '#6366f1'` | `bg-poly-indigo` |
| `borderRadius: 16` | `rounded-2xl` |
| `borderRadius: 12` | `rounded-xl` |
| `padding: 16` | `p-4` |
| `gap: 12` | `gap-3` |

### Typography Scale

| Mobile | Web |
|---|---|
| `fontSize: 32, fontWeight: 'bold'` | `text-3xl font-bold` |
| `fontSize: 20, fontWeight: 'bold'` | `text-xl font-bold` |
| `fontSize: 16, fontWeight: '600'` | `text-base font-semibold` |
| `fontSize: 14` | `text-sm` |
| `fontSize: 12` | `text-xs` |

---

## 7. Shared Code Strategy

### What Can Be Shared (via a `shared/` package)

```
polymath-os-android/
├── shared/                  # NEW — shared code between mobile & web
│   ├── types.ts             # TypeScript interfaces (Activity, Journal, etc.)
│   ├── api.ts               # API client (axios instance + typed endpoints)
│   ├── constants.ts         # Category colors, label maps
│   └── utils.ts             # Date formatters, hash generators
```

### Types (extracted from mobile + backend models)

```typescript
// shared/types.ts
export interface Activity {
  id: string;
  title: string;
  url?: string;
  source: string;
  category?: string;
  content_type?: string;
  notes?: string;
  timestamp: string;
  hash?: string;
  ai_analysis?: {
    category: string;
    content_type: string;
    key_topics: string[];
    domain: string;
    learning_value: number;
  };
}

export interface Journal {
  id: string;
  title: string;
  content: string;
  tags: string[];
  linked_activities: string[];
  timestamp: string;
}

export interface Connection {
  id: string;
  from_id: string;
  to_id: string;
  connection_type: string;
  reasoning: string;
  strength: number;
  timestamp: string;
}

export interface AgentMemory {
  id: string;
  memory_type: 'short_term' | 'long_term' | 'insight' | 'pattern' | 'archived';
  content: string;
  source: string;
  importance: number;
  access_count: number;
  last_accessed?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  focus_areas: string[];
  behavior_traits: string[];
  custom_instructions: string;
  is_active: boolean;
}

export interface Stats {
  total_activities: number;
  total_journals: number;
  total_connections: number;
  categories: Record<string, number>;
  sources: Record<string, number>;
}
```

### API Client (shared between mobile & web)

```typescript
// shared/api.ts
import axios from 'axios';
import type { Activity, Journal, Connection, Stats, AgentMemory, Persona } from './types';

export function createApiClient(baseUrl: string) {
  const client = axios.create({ baseURL: `${baseUrl}/api` });

  return {
    // Activities
    getActivities: (limit = 100) => client.get<Activity[]>('/activities', { params: { limit } }),
    createActivity: (data: { title: string; url?: string; notes?: string }) =>
      client.post<Activity>('/activities/manual', data),
    uploadActivities: (file: File | FormData) => client.post('/activities/upload', file),
    deleteActivity: (id: string) => client.delete(`/activities/${id}`),

    // Journals
    getJournals: (limit = 100) => client.get<Journal[]>('/journals', { params: { limit } }),
    createJournal: (data: { title: string; content: string; tags?: string[] }) =>
      client.post<Journal>('/journals', data),
    updateJournal: (id: string, data: Partial<Journal>) => client.put(`/journals/${id}`, data),
    deleteJournal: (id: string) => client.delete(`/journals/${id}`),

    // Connections
    getConnections: () => client.get<Connection[]>('/connections'),
    generateConnections: (activityId: string) =>
      client.post(`/ai/generate-connections/${activityId}`),

    // AI
    getSuggestions: () => client.get('/ai/suggestions'),

    // Stats
    getStats: () => client.get<Stats>('/stats'),

    // Agent
    getMemories: (limit = 100) => client.get<AgentMemory[]>('/agent/memory', { params: { limit } }),
    deleteMemory: (id: string) => client.delete(`/agent/memory/${id}`),
    learnFromData: () => client.post('/agent/learn'),
    consolidateMemories: () => client.post('/agent/consolidate'),
    getPersona: () => client.get<Persona>('/agent/persona'),
    updatePersona: (data: Partial<Persona>) => client.put('/agent/persona', data),
    getLearningLogs: (limit = 50) => client.get('/agent/learning-logs', { params: { limit } }),
    chatWithAgent: (message: string) => client.get('/agent/chat', { params: { message } }),
    getAgentStats: () => client.get('/agent/stats'),

    // Export/Import
    exportJson: () => client.post('/export/json'),
    exportMarkdown: () => client.post('/export/markdown'),
    exportCsv: () => client.post('/export/csv'),
    importRestore: (file: File | FormData) => client.post('/import/restore', file),
  };
}
```

---

## 8. Implementation Plan (Phases)

### Phase 1 — Scaffold + Dashboard + Activities (Week 1)

| Task | Details |
|------|---------|
| Init Next.js project | `bunx create-next-app@latest web --typescript --tailwind --app --src-dir` |
| Configure Tailwind theme | Add the `poly-*` color tokens from Section 6 |
| Create `shared/` package | Types, API client, constants |
| Build layout shell | Sidebar nav (tabs become sidebar links), dark theme `<body>` |
| Dashboard page (`/`) | Stats grid, recent activities, category chips — exact match |
| Activities page (`/activities`) | Activity list, add modal, JSON file upload (drag-and-drop) |
| Connect to backend | Same `BACKEND_URL` env var, CORS already allows `*` |

### Phase 2 — Remaining Pages (Week 2)

| Task | Details |
|------|---------|
| Journal page (`/journal`) | Journal cards, create/edit modal |
| Connections page (`/connections`) | Timeline view, connection cards, AI suggestions |
| Export page (`/export`) | Export buttons (browser download), import with file picker |
| Agent page (`/agent`) | Memory list, persona editor, chat interface |

### Phase 3 — Polish + Web Enhancements (Week 3)

| Task | Details |
|------|---------|
| Responsive layouts | Mobile-web responsive (sidebar collapses to bottom nav on small screens) |
| Loading/error states | Skeleton loaders, error boundaries |
| Keyboard shortcuts | Cmd+N, Cmd+K, Escape to close modals |
| Rich text journal editor | Tiptap or similar for journal entries |
| Graph visualization | D3.js / react-force-graph for connections tab |
| `refetchOnWindowFocus` | TanStack Query for seamless cross-device freshness |

### Phase 4 — Optional Real-Time (Week 4+)

| Task | Details |
|------|---------|
| WebSocket/SSE endpoint | Add to FastAPI backend for push updates |
| Live notifications | "New activity added from mobile" toast |
| PWA support | Service worker, installable web app, offline indicator |

---

## 9. File Structure

```
polymath-os-android/
├── .venv/                     # Python venv (uv)
├── backend/                   # FastAPI (unchanged)
├── frontend/                  # Expo/React Native mobile app
├── web/                       # NEW — Next.js web app
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx         # Root layout (sidebar + dark theme)
│   │   │   ├── page.tsx           # Dashboard (/)
│   │   │   ├── activities/
│   │   │   │   └── page.tsx       # Activities page
│   │   │   ├── journal/
│   │   │   │   └── page.tsx       # Journal page
│   │   │   ├── connections/
│   │   │   │   └── page.tsx       # Connections page
│   │   │   ├── export/
│   │   │   │   └── page.tsx       # Export/Import page
│   │   │   └── agent/
│   │   │       └── page.tsx       # Agent Memory page
│   │   ├── components/
│   │   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   │   ├── StatsCard.tsx      # Reusable stat card
│   │   │   ├── ActivityCard.tsx   # Activity list item
│   │   │   ├── JournalCard.tsx    # Journal list item
│   │   │   ├── MemoryCard.tsx     # Agent memory item
│   │   │   ├── CategoryBadge.tsx  # Color-coded category chip
│   │   │   ├── Modal.tsx          # Generic modal wrapper
│   │   │   └── ChatPanel.tsx      # Agent chat interface
│   │   ├── hooks/
│   │   │   ├── useActivities.ts   # TanStack Query hook
│   │   │   ├── useJournals.ts
│   │   │   ├── useConnections.ts
│   │   │   ├── useAgent.ts
│   │   │   └── useStats.ts
│   │   └── lib/
│   │       └── api.ts             # Re-export from shared/
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   ├── package.json
│   └── .env.local                 # NEXT_PUBLIC_BACKEND_URL=http://localhost:8001
├── shared/                    # NEW — shared types + API client
│   ├── types.ts
│   ├── api.ts
│   ├── constants.ts
│   └── package.json           # { "name": "@polymath/shared" }
└── ...
```

---

## 10. Technology Stack

| Layer | Mobile (Existing) | Web (New) | Shared |
|-------|-------------------|-----------|--------|
| **Framework** | Expo SDK 54 / RN 0.81 | Next.js 15 (App Router) | — |
| **Styling** | `StyleSheet.create()` | Tailwind CSS (same colors) | Color tokens |
| **Routing** | expo-router | Next.js App Router | — |
| **State** | Zustand (in-memory) | TanStack Query (server state) | — |
| **API Client** | Axios | Axios | `shared/api.ts` |
| **Types** | Inline interfaces | TypeScript | `shared/types.ts` |
| **Icons** | `@expo/vector-icons` (Ionicons) | `lucide-react` or `react-icons` (similar style) | Icon name mapping |
| **Backend** | FastAPI | FastAPI (same!) | — |
| **Database** | MongoDB | MongoDB (same!) | — |
| **Package Mgr** | Bun | Bun | — |

### Why TanStack Query instead of Zustand for web?

The mobile app uses Zustand as a simple in-memory cache that gets populated from API calls. The web app is better served by TanStack Query because:

1. **Auto-refetch on window focus** — the key mechanism for cross-device sync
2. **Cache invalidation** — after a mutation (create/delete), automatically refetch the list
3. **Stale-while-revalidate** — show cached data instantly, update in background
4. **No manual loading/error state management** — built-in
5. **Devtools** — inspect cache state during development

The mobile app could also be migrated to TanStack Query later for the same benefits (future enhancement).

---

## 11. Alternative: Expo Web (and why not)

The current Expo project already supports `npx expo start --web`. Why not just use that?

| Issue | Impact |
|-------|--------|
| React Native primitives (`View`, `Text`, `ScrollView`) render as nested `<div>`s with inline styles | Bloated DOM, poor performance, no CSS cascade |
| `react-native-web` has limited support for complex gestures | Reanimated, gesture-handler don't fully translate |
| No SSR/SSG | Slow initial load, poor SEO |
| `expo-document-picker`, `expo-file-system`, `expo-sharing` have no web equivalents or minimal stubs | File operations break or need polyfills |
| Mobile-first layout doesn't adapt to desktop viewports | Cards stretch to full width, no sidebar, wasted space |
| `react-native-gifted-charts` doesn't render on web | Charts break without a web fallback |

**Bottom line:** Expo Web is great for quick previews during development, but for a production web app you want proper web primitives, CSS, and responsive layouts. A dedicated Next.js app takes marginally more effort but produces a dramatically better result.

---

## Quick Start Checklist

When you're ready to implement:

```powershell
# 1. Create the Next.js project
cd polymath-os-android
bunx create-next-app@latest web --typescript --tailwind --app --src-dir --import-alias "@/*"

# 2. Install dependencies
cd web
bun add axios @tanstack/react-query lucide-react

# 3. Create env file
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8001" > .env.local

# 4. Start dev server
bun dev   # → http://localhost:3000
```

Then start building pages — the API is already done. Every endpoint you see at http://localhost:8001/docs is ready to use.

---

*Last updated: February 2026*
