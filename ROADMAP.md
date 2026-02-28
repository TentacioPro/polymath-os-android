# Polymath OS — Development Roadmap

> Actionable next steps, ordered by priority. Updated February 28, 2026.

---

## Current State

| Layer | Status | Notes |
|-------|--------|-------|
| **Backend (FastAPI)** | ✅ Running | All 30+ endpoints, AI categorization, export/import |
| **Mobile (Expo RN)** | ✅ Compiles & runs | 5-tab app, Expo Go ready, needs real-device testing |
| **Web (Next.js)** | ✅ Builds clean | 6 pages, TanStack Query, feature parity with mobile |
| **CI/CD** | ✅ Configured | 3 GitHub Actions workflows (CI, OpenHands, auto-commit) |
| **Error Tracking** | ✅ Integrated | Sentry opt-in (backend + web), mobile template ready |
| **Docs** | ✅ Comprehensive | 7 docs + guides |

---

## Phase 0 — Stabilize & Test (NOW — 1-2 days)

> Get the mobile app actually running on your phone and verify everything end-to-end.

### 0.1 Run Mobile on Physical Device
```bash
# 1. Start backend
cd backend && uv run uvicorn server:app --host 0.0.0.0 --port 8001

# 2. Start Expo (already running)
cd frontend && npx expo start

# 3. Scan QR code with Expo Go app on your Android phone
#    Make sure phone and PC are on same WiFi network

# 4. Update .env with your PC's local IP (not localhost!)
#    frontend/.env → EXPO_PUBLIC_BACKEND_URL=http://192.168.0.104:8001
```

### 0.2 End-to-End Smoke Test
- [ ] Dashboard loads stats (or shows zeros if DB is empty)
- [ ] Create a manual activity → appears in list
- [ ] Create a journal entry → appears with tags
- [ ] Generate connections → timeline/graph/suggestions populate
- [ ] Export JSON → download works
- [ ] Import JSON → restores state
- [ ] Delete an activity → removed from list

### 0.3 Fix Known Compatibility Warnings
```bash
# Expo flagged these version mismatches:
cd frontend
npx expo install @react-native-async-storage/async-storage@2.2.0 react-native-svg@15.12.1
```

### 0.4 MongoDB Setup (if not done)
```bash
# Option A: Local MongoDB
# Download from https://www.mongodb.com/try/download/community

# Option B: Free MongoDB Atlas (recommended)
# 1. Go to https://cloud.mongodb.com → Create free cluster
# 2. Get connection string
# 3. Add to backend/.env:
#    MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net
#    DB_NAME=polymath_os
```

---

## Phase 1 — Mobile Polish (3-5 days)

> Make the mobile app production-worthy.

| Task | Effort | Files |
|------|--------|-------|
| **1.1** Agent tab (missing on mobile) | 4-6h | `frontend/app/(tabs)/agent.tsx`, tab layout |
| **1.2** Detail views (tap activity → full view) | 4h | `frontend/app/activity/[id].tsx`, `journal/[id].tsx` |
| **1.3** Edit & delete UI (swipe or long-press) | 3h | All list screens |
| **1.4** Pull-to-refresh on all lists | 1h | All tab screens |
| **1.5** Image export with "Abishek M" watermark | 3h | `connections.tsx` + `react-native-view-shot` |
| **1.6** PDF & PPT export buttons | 2h | `export.tsx` |
| **1.7** Search bar + category filter | 4h | `activities.tsx`, new component |
| **1.8** Sentry integration (wrap root layout) | 30min | `_layout.tsx` |
| **1.9** App icon & splash screen branding | 1h | `assets/images/`, `app.json` |

---

## Phase 2 — API Integrations (1-2 weeks)

> Automate activity ingestion instead of manual entry.

| Task | Effort | Impact |
|------|--------|--------|
| **2.1** YouTube Data API sync | 8-10h | Auto-import watch history |
| **2.2** Google Search history import | 6-8h | Auto-import search queries |
| **2.3** Settings screen (API keys, sync config) | 4h | Central configuration UI |
| **2.4** Background periodic sync | 6h | Set-and-forget automation |
| **2.5** Browser extension (Chrome) | 10-12h | Real-time browsing capture |

---

## Phase 3 — Enhanced Visualizations (1-2 weeks)

| Task | Effort | Impact |
|------|--------|--------|
| **3.1** Interactive graph (D3/react-native-graph) | 12-15h | Real node-edge network diagram |
| **3.2** Learning heatmap (GitHub-style) | 4h | Daily activity intensity grid |
| **3.3** Category pie/bar charts | 3h | Visual distribution of domains |
| **3.4** Progressive timeline (zoom in/out) | 6h | Year → Month → Day drill-down |

---

## Phase 4 — Production & Distribution (1 week)

| Task | Effort | Notes |
|------|--------|-------|
| **4.1** EAS Build setup (APK/AAB) | 2h | `eas build --platform android` |
| **4.2** Deploy backend (Railway/Render) | 1h | Free tier, auto-deploy from GitHub |
| **4.3** Deploy web app (Vercel) | 30min | Git-push to deploy |
| **4.4** Custom domain | 30min | `polymathOS.app` or similar |
| **4.5** Google Play Store listing | 2h | Screenshots, description, privacy policy |
| **4.6** Authentication (optional) | 8-10h | Multi-user support, JWT |

---

## Phase 5 — Advanced Features (Ongoing)

| Task | Effort | Impact |
|------|--------|--------|
| **5.1** Offline mode + sync queue | 20h | Works without internet |
| **5.2** Push notifications (daily summary) | 6h | "You learned 5 new topics today" |
| **5.3** Spaced repetition reminders | 8h | Review connections on schedule |
| **5.4** Multi-LLM provider UI | 4h | Switch between OpenAI/Anthropic/Gemini |
| **5.5** Voice journaling (Whisper API) | 6h | Speak → transcribe → journal entry |
| **5.6** Collaborative mode | 15h | Share learning graphs with others |

---

## Mobile Build Guide

### Development (Expo Go — what you're doing now)

```bash
# Start Expo dev server
cd frontend
npx expo start

# On phone: Install "Expo Go" from Play Store
# Scan the QR code → app loads instantly
# Hot reload: edit code → auto-refreshes on phone
```

### Preview Build (APK for testing without Expo Go)

```bash
# One-time setup
npm install -g eas-cli
eas login  # Create account at expo.dev

# Build APK (runs in Expo's cloud, ~10-15 min)
cd frontend
eas build --platform android --profile preview

# Downloads an APK you can install directly on any Android device
```

Add this to `frontend/eas.json`:
```json
{
  "cli": { "version": ">= 3.0.0" },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### Production Build (Play Store)

```bash
# Build AAB (Android App Bundle) for Play Store
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

### Local Build (no cloud, no Expo account)

```bash
# Requires Android Studio + JDK installed
cd frontend

# Generate native android/ directory
npx expo prebuild --platform android

# Build APK locally
cd android && ./gradlew assembleRelease

# APK at: android/app/build/outputs/apk/release/app-release.apk
```

---

## Immediate Next Action

**Right now**, do this:

1. Make sure MongoDB is running (local or Atlas)
2. Fill in `backend/.env` with MONGO_URL, DB_NAME, OPENAI_API_KEY
3. Start the backend: `cd backend && uv run uvicorn server:app --host 0.0.0.0 --port 8001`
4. Update `frontend/.env` with your PC's IP: `EXPO_PUBLIC_BACKEND_URL=http://<YOUR-PC-IP>:8001`
5. Open Expo Go on your phone → scan QR code
6. Test: create an activity, write a journal, generate connections, export data

Once that works end-to-end, move to Phase 1 (mobile polish).

---

*This is a living document. Update as tasks are completed.*
