# Polymath OS — Development Roadmap

> Actionable next steps, ordered by priority. Updated March 21, 2026.
> **Canonical source of truth for detailed phase tracking**: `qoder-agent-docs/`

---

## Current State

| Layer | Status | Notes |
|-------|--------|-------|
| **Backend (FastAPI)** | ✅ Production-ready | 40+ endpoints, PATCH /activities rename, AI categorization, export/import, JWT auth, rate limiting, security headers |
| **Mobile (Expo RN)** | ✅ V4 complete | M3 component library (16 components), V4 9-phase revamp done, 303 Jest tests |
| **Web (Next.js)** | ✅ V4 complete | 15 routes, M3 component library (14+ components), V4 9-phase revamp done |
| **CI/CD** | ✅ Strict gates | Lint/type checks enforced, no continue-on-error |
| **Error Tracking** | ✅ Full coverage | Sentry active on backend + web + mobile |
| **Security** | ✅ Enterprise-grade | JWT auth, encryption, validation, audit logging |
| **Design System** | ✅ V4 complete | Kole Jain × Material You M3, 7 themes, shared design-tokens.ts |

---

## V4 UI Revamp — COMPLETE (feat/ui-revamp-v4)

All 9 phases done on both mobile and web. See `qoder-agent-docs/08_UI_REVAMP_V4_PLAN.md`.

| Phase | Status | Commit |
|-------|--------|--------|
| 0 — Token Precision Audit | ✅ DONE | 7a22a15 |
| 1 — Spacing + Icon Audit | ✅ DONE | cfe6164 |
| 2 — M3 State Matrix | ✅ DONE | 7909e53 + d29b262 |
| 3 — Optimistic UI | ✅ DONE | 45112aa |
| 4 — Container Queries | ✅ DONE | da686eb |
| 5 — Animation Audit | ✅ DONE | 8adc49c |
| 6 — Empty States | ✅ DONE | 11ef783 |
| 7 — Interruption Routing (Popover + Rename) | ✅ DONE | 76f972b |
| 8 — Bento Dashboard | ✅ DONE | 861a3cf |

---

## Security Implementation (✅ COMPLETE - 2026-03-16)

| Feature | Status | Details |
|---------|--------|---------|
| JWT Authentication | ✅ | Access + refresh tokens, Argon2id hashing |
| Field Encryption | ✅ | AES-256-GCM for sensitive data |
| Input Validation | ✅ | Pydantic schemas, regex patterns |
| XSS Sanitization | ✅ | bleach library strips HTML |
| Request Size Limits | ✅ | 10MB max body (configurable) |
| Audit Logging | ✅ | All sensitive ops logged |
| Account Lockout | ✅ | 5 failed attempts → 30min lock |
| Password Policy | ✅ | 12+ chars, mixed case, digit, special |

---

## Next Milestones

### M2 — Device QA + Release Stability (Immediate Priority)

| Task | Effort | Status |
|------|--------|--------|
| Wire VoiceRecorder to expo-audio AudioModule | 3-4h | ⏳ Pending |
| Device matrix QA (low-end Android + tablet) | 1 day | ⏳ Pending |
| Offline/poor-network behavior audit | 3h | ⏳ Pending |
| EAS build verification (preview + production) | 2h | ⏳ Pending |
| Merge feat/ui-revamp-v4 → main | 30min | ⏳ Pending |

### M3 — Production Deployment

| Task | Effort | Notes |
|------|--------|-------|
| Deploy backend (Railway/Render) | 1h | Free tier, auto-deploy from GitHub |
| Deploy web app (Vercel) | 30min | Git-push to deploy |
| Google Play Store listing | 2h | Screenshots, description, privacy policy |
| Custom domain | 30min | polymathOS.app or similar |

### M4 — Product Analytics & Observability

| Task | Effort | Notes |
|------|--------|-------|
| Activate analytics provider (Mixpanel/PostHog) | 2-3h | Event taxonomy already defined in utils/analytics.ts |
| Sentry release tags + environment tags | 1h | Per-platform breadcrumbs |
| Crash-free session KPI tracking | 2h | Mobile release health |

### M5 — Advanced Features (Future)

| Task | Effort | Impact |
|------|--------|--------|
| Voice journaling (expo-audio Whisper) | 6h | Speak → transcribe → journal entry |
| YouTube / Google history API sync | 8-10h | Auto-import watch/search history |
| Push notifications (daily summary) | 6h | "You learned 5 topics today" |
| Spaced repetition reminders | 8h | Review connections on schedule |
| Multi-LLM provider UI | 4h | Switch OpenAI/Anthropic/Gemini |
| Collaborative mode | 15h | Share learning graphs |
| Browser extension (Chrome) | 10-12h | Real-time browsing capture |

---

## Mobile Build Guide

### Development (Expo Go)
```bash
cd frontend && npx expo start
# Install "Expo Go" on phone → scan QR code
```

### Preview Build (APK)
```bash
npm install -g eas-cli && eas login
cd frontend && eas build --platform android --profile preview
```

### Production Build (Play Store)
```bash
eas build --platform android --profile production
eas submit --platform android
```

---

## Immediate Next Action

1. Merge `feat/ui-revamp-v4` → `main` after final QA pass
2. Wire VoiceRecorder audio API (last M0 gap)
3. EAS preview build → install on device → full regression test
4. Deploy backend + web to production

---

*Last updated: March 21, 2026 — V4 revamp complete across mobile + web.*
