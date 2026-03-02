# Polymath OS — Web vs Mobile Gap Analysis

> Generated: March 2, 2026 | Compares: Web (Next.js) vs Mobile (Expo/React Native)

---

## Missing Screens / Pages

| Feature | Mobile | Web |
|---------|--------|-----|
| **Search** | `search.tsx` — full-text across knowledge, wired to `GET /api/search` | **Missing entirely** — no search page, no search bar, no hook |
| **Profile / Settings** | `profile.tsx` — persona info, data stats, links to sub-screens | **Missing** — no profile page at all |
| **Appearance** | `appearance.tsx` — dedicated page, 7 themes with live preview cards, dark/light grouping | **Missing** — theme switching is just a tiny button in sidebar/drawer, only 3 themes vs 7 |
| **Customize / Personalization** | `customize.tsx` — dashboard layout (grid/list/compact), sidebar position (left/right/hidden), profile layout, screen visibility toggles | **Missing entirely** — zero personalization options |
| **Analytics** | `analytics.tsx` — stats overview, category breakdown bar charts, agent stats, system health | **Missing** — no analytics page |
| **Alerts / Notifications** | `alerts.tsx` — notification list with success/warning/info types | **Missing** — no notification system |
| **Activity Detail** | `activity-detail.tsx` — single activity deep-dive with AI analysis, timestamps, notes | **Missing** — clicking an activity card does nothing |
| **Journal** | `journal.tsx` — full CRUD with tags + linked activities + edit | Web has create + delete but **no edit UI** (API exists unused) |
| **Integrations** | `integrations.tsx` — AI config (OpenAI API key + model setup), system health | **Missing** — no way to configure AI provider from the web |

---

## Missing Components / UI Patterns

| Feature | Mobile | Web |
|---------|--------|-----|
| **Quick Capture modal** | `QuickCapture.tsx` — bottom sheet with text input, Voice/Link/Scan/File action buttons, clipboard paste, submits to API | **Missing** — the "+" button just navigates to `/activities`, no capture UX |
| **Skeleton loaders** | `Skeleton.tsx` — shimmer animation component used across screens | **Missing** — only uses generic spinners |
| **Error boundary** | `ErrorBoundary.tsx` — catches render errors, retry UI | Only Sentry's `global-error.tsx`, no per-component boundaries |
| **Haptic / interaction feedback** | 7 haptic variants used throughout | **Nothing** — no toast, no animation feedback on actions |
| **Themed typography component** | `ThemedText.tsx` — display/heading/body/caption/mono variants | **Missing** — raw `<p>` and `<h>` tags with inline Tailwind |

---

## Theme System Gap

| Aspect | Mobile | Web |
|--------|--------|-----|
| Number of themes | **7** (Void, Nova, Amber, Ocean, Forest, Sunset, Midnight) | **3** (Black, Amber, Nova) |
| Theme preview | Full live preview cards with color swatches | Text-only buttons |
| System preference detection | N/A | **Missing** — no `prefers-color-scheme` auto-detection |

---

## API Wiring Gap

| Endpoint | Mobile | Web |
|----------|--------|-----|
| `GET /api/search?q=` | Wired | **Not wired** |
| `GET /api/health` | Wired (Analytics, Integrations) | **Not wired** (fakes "OPERATIONAL") |
| `GET /api/notifications` | Wired | **Not wired** |
| `GET/POST /api/ai-config` | Wired | **Not wired** |
| `PUT /api/journals/:id` | Wired (edit UI) | API defined but **no UI uses it** |
| `GET /api/activities/:id` | Wired (detail view) | **Not wired** |
| `PUT /api/activities/:id` | Wired (edit) | **Not wired** |

---

## Personalization / Preferences

| Preference | Mobile | Web |
|------------|--------|-----|
| Dashboard layout (grid/list/compact) | Configurable | **Fixed** |
| Sidebar position (left/right/hidden) | Configurable | **Fixed left** |
| Screen visibility toggles | Per-screen on/off | **None** |
| Quick Capture toggle | Show/hide on home & sidebar | **N/A** — doesn't exist |
| Profile layout (full/minimal) | Configurable | **N/A** — no profile |
| Preferences persisted | Zustand + AsyncStorage | **N/A** |

---

## Priority Summary

### Critical Gaps (core functionality the web is missing)

1. **Search** — users can't find anything
2. **Activity Detail** — clicking items does nothing
3. **Journal Edit** — API exists, just needs UI
4. **Quick Capture** — the "+" button should open a capture modal, not redirect

### Feature Gaps (the web has no equivalent)

5. Customize / Personalization page
6. Analytics page
7. Profile / Settings page
8. Appearance page (dedicated, with all 7 themes)
9. Alerts / Notifications
10. Integrations / AI Config

### Polish Gaps (UX quality)

11. 4 missing themes (Ocean, Forest, Sunset, Midnight)
12. Skeleton loading states
13. Toast / feedback system
14. System health check (real, not hardcoded)
