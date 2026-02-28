# Error Tracking & Monitoring — Setup Guide

> Free, open-source error tracking with **Sentry** across all three layers: Backend (FastAPI), Web (Next.js), and Mobile (Expo/React Native).

---

## Why Sentry?

| Feature | Sentry (Free Tier) |
|---------|-------------------|
| **Events/month** | 10,000 |
| **Error tracking** | ✅ Full stack traces, breadcrumbs, context |
| **Performance monitoring** | ✅ Transaction traces, slow queries |
| **Session replay** | ✅ 50 replays/month (web only) |
| **Alerts** | ✅ Email, Slack, Discord, PagerDuty |
| **Release tracking** | ✅ Track which deploy introduced a bug |
| **Source maps** | ✅ Readable stack traces in production |
| **Open source** | ✅ BSL license, fully self-hostable |
| **SDKs** | Python, Next.js, React Native — official |

**Alternatives** (if you prefer fully MIT/Apache):
- **GlitchTip** — Sentry-compatible, MIT license, self-hosted
- **Highlight.io** — session replay + errors, Apache 2.0
- **PostHog** — analytics + errors, MIT license

---

## Quick Start (5 minutes)

### 1. Create a Sentry Account

1. Go to [sentry.io](https://sentry.io) → **Sign Up** (free)
2. Create an **Organization** (e.g., `polymath`)
3. Create **3 Projects**:
   - **polymath-backend** → Platform: `Python` → Framework: `FastAPI`
   - **polymath-web** → Platform: `JavaScript` → Framework: `Next.js`
   - **polymath-mobile** → Platform: `React Native`
4. Copy each project's **DSN** (looks like `https://abc123@o0.ingest.sentry.io/456`)

### 2. Backend (FastAPI) — Already Integrated

The backend integration is already in `backend/server.py`. Just add your DSN:

```bash
# backend/.env
SENTRY_DSN=https://your-dsn@o0.ingest.sentry.io/project-id
SENTRY_ENV=development   # or "production"
```

**What gets tracked:**
- Unhandled exceptions in API routes
- Slow database queries (>200ms)
- OpenAI API failures
- Background task errors

**Test it:**
```python
# Add temporarily to any endpoint to verify:
sentry_sdk.capture_message("Sentry test from Polymath backend!")
```

### 3. Web App (Next.js) — Already Configured

Config files are already created:
- `web/sentry.client.config.ts` — Browser-side tracking
- `web/sentry.server.config.ts` — Server-side tracking  
- `web/sentry.edge.config.ts` — Edge runtime tracking
- `web/src/instrumentation.ts` — Auto-loads on server start
- `web/src/app/global-error.tsx` — React error boundary
- `web/next.config.ts` — Wraps build with Sentry plugin

Install and configure:

```bash
cd web

# Install (already in package.json)
bun install

# Add your DSN
echo "NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@o0.ingest.sentry.io/project-id" >> .env.local
```

**What gets tracked:**
- React rendering errors (caught by global-error.tsx)
- API call failures
- Unhandled promise rejections
- Client-side exceptions
- Performance traces (page loads, API calls)

### 4. Mobile App (Expo/React Native)

```bash
cd frontend

# Install Sentry for Expo
bunx expo install @sentry/react-native

# Add DSN to your .env
echo "EXPO_PUBLIC_SENTRY_DSN=https://your-dsn@o0.ingest.sentry.io/project-id" >> .env
```

Then wrap your root layout:

```tsx
// frontend/app/_layout.tsx
import * as Sentry from '@sentry/react-native';

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.2,
    enabled: !__DEV__,  // Only in production builds
  });
}

// Wrap your root component export:
export default Sentry.wrap(RootLayout);
```

---

## Self-Hosting (Fully Free, No Limits)

If you want **zero cloud dependency**, self-host Sentry or GlitchTip:

### Option A: Self-Host Sentry

```bash
# Requires Docker + 4GB RAM minimum
git clone https://github.com/getsentry/self-hosted.git
cd self-hosted
./install.sh
docker compose up -d
```

- Dashboard at `http://localhost:9000`
- No event limits
- Full feature parity with cloud

### Option B: GlitchTip (Lightweight Alternative)

```bash
# Much lighter than Sentry — runs on 512MB RAM
docker run -d \
  -p 8000:8000 \
  -e DATABASE_URL=postgres://user:pass@db:5432/glitchtip \
  -e SECRET_KEY=$(openssl rand -hex 32) \
  glitchtip/glitchtip
```

- Uses **Sentry SDKs** — same `sentry_sdk.init()` code, just change the DSN
- MIT license (truly open source)
- Dashboard at `http://localhost:8000`

---

## Alert Configuration

### Sentry Cloud Alerts (Recommended)

1. Go to **Sentry → Alerts → Create Alert**
2. Set up these rules:

| Alert | Condition | Action |
|-------|-----------|--------|
| **New error** | First occurrence of an issue | Email + Slack |
| **Error spike** | >10 events in 1 hour | Email + Slack |
| **Slow API** | Transaction >2s | Email |
| **Crash rate** | >1% of sessions crash | Email + Discord |

### Discord Webhook (Free)

1. In Discord: Server Settings → Integrations → Webhooks → New
2. In Sentry: Settings → Integrations → Discord → Add Webhook URL
3. Now errors notify your Discord channel in real-time

---

## Environment Variables Summary

| Variable | Where | Required |
|----------|-------|----------|
| `SENTRY_DSN` | `backend/.env` | No (optional) |
| `SENTRY_ENV` | `backend/.env` | No (defaults to "development") |
| `NEXT_PUBLIC_SENTRY_DSN` | `web/.env.local` | No (optional) |
| `EXPO_PUBLIC_SENTRY_DSN` | `frontend/.env` | No (optional) |

All Sentry integrations are **opt-in** — the app works fine without any DSN configured.

---

*Last updated: February 2026*
