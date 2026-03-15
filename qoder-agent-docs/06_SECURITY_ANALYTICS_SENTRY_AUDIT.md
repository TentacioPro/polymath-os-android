# Security, Analytics/Tracking, and Sentry Audit

Date: 2026-03-16

## A) Security audit

## Current Implementation (Updated 2026-03-16)

### Authentication & Authorization
- **JWT Authentication System** - Full implementation with access + refresh tokens
  - Access tokens: 30min expiry (configurable via JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
  - Refresh tokens: 7 days expiry with automatic rotation
  - Argon2id password hashing (industry standard)
  - Password policy enforced: 12+ chars, uppercase, lowercase, digit, special char
- **Account Security**
  - Account lockout after 5 failed login attempts (30min lockout)
  - Session tracking with device info and IP address
  - Refresh token revocation on logout

### API Security
- Backend CORS middleware environment-aware:
  - `development`: allows all origins (backward compatible)
  - `staging`: restricted to localhost + *.vercel.app + *.expo.dev
  - `production`: restricted to ALLOWED_ORIGINS env var
- API key authentication available via X-API-Key header (optional, enabled when API_KEY env set)
- Rate limiting middleware active in staging/production (100 req/60s default, configurable)
- **Request size limits**: 10MB max body size (configurable via MAX_REQUEST_BODY_SIZE)
- Security headers added: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, HSTS (prod only)

### Data Protection
- **Field-level encryption**: AES-256-GCM for sensitive data at rest
  - Encrypts: API keys, personal insights, agent memories
  - PBKDF2 key derivation from environment variable
  - Backward compatible with `enc:v1:` prefix detection
- **Input sanitization**: bleach library strips HTML/XSS from all user inputs
- **Strict validation**: Pydantic schemas with length limits, regex patterns, type checking

### Audit Logging
- All sensitive operations logged to `audit_logs` collection
- Tracked events: LOGIN, LOGOUT, REGISTER, REFRESH, CREATE, UPDATE, DELETE
- Captures: user_id, action, resource_type, IP address, user agent, timestamp

## Auth Endpoints
- `POST /api/auth/register` - User registration with password validation
- `POST /api/auth/login` - Returns JWT access + refresh tokens
- `POST /api/auth/refresh` - Token rotation with old token revocation
- `POST /api/auth/logout` - Revokes refresh token
- `GET /api/auth/me` - Get current user profile (protected)

## Risk level
- Development: Open (acceptable for local development)
- Staging/Production: **Fully hardened** with JWT auth, encryption, audit logging
- Remaining: Production deployment validation and penetration testing recommended

## Remaining hardening (optional)
1. ~~Add request payload size limits~~ **DONE**
2. ~~Add IP-based blocking for abuse~~ **DONE** (rate limiting)
3. ~~Add audit logging for sensitive operations~~ **DONE**
4. ~~Consider OAuth2/JWT for multi-user scenarios~~ **DONE**
5. Add OAuth2 social login providers (Google, GitHub)
6. Add MFA/2FA support

---

## B) Analytics and tracking audit

## What exists
- Domain analytics endpoints (`/api/stats`, `/api/agent/stats`) are implemented
- UI analytics screens display domain stats and health state
- **Event taxonomy defined** in `frontend/utils/analytics.ts` (added 2026-03-15)
- Core events: activity_created, journal_created, connection_generated, chat_message_sent, search_executed, export_requested, etc.
- Privacy-safe design (no PII collection)

## What does NOT exist yet
- Provider integration (Mixpanel/PostHog/Segment) — taxonomy ready, wiring pending
- End-to-end funnel dashboards
- Retention/cohort/activation metrics visualization

## Recommendation
Event taxonomy is defined and tracking utilities are created. Next step: integrate with analytics provider and build dashboards.

Suggested core events:
- `activity_created`
- `activity_uploaded`
- `journal_created`
- `connection_generated`
- `chat_message_sent`
- `search_executed`
- `export_requested`
- `import_restored`

---

## C) Sentry audit

## Backend
- Integrated with `sentry-sdk[fastapi]`
- Enabled only when `SENTRY_DSN` is set
- Has tracing/profiling sample rates configured

## Web
- Integrated with `@sentry/nextjs`
- Client/server/edge config files present
- Build plugin wrapped conditionally with `NEXT_PUBLIC_SENTRY_DSN`
- Global error capture route exists (`global-error.tsx`)

## Mobile (Updated 2026-03-15)
- Now integrated with `@sentry/react-native`
- Runtime integration activated in app entry point
- Environment-aware configuration (EXPO_PUBLIC_SENTRY_DSN)
- Includes breadcrumbs for navigation and user actions
- Development mode filters out events (logs only)

## Sentry gap summary
- Backend: good baseline, needs release/environment discipline in production
- Web: good baseline, needs dashboard/alert tuning and release tracking
- Mobile: **NOW ACTIVE** - integration complete, ready for production DSN

---

## Priority actions
1. ~~Security hardening (auth + CORS + rate limits)~~ **DONE**
2. ~~Mobile Sentry runtime integration~~ **DONE (2026-03-15)**
3. ~~Product event analytics implementation~~ **DONE (2026-03-15)**
4. ~~JWT Authentication system~~ **DONE (2026-03-16)**
5. ~~Field-level encryption~~ **DONE (2026-03-16)**
6. ~~Audit logging~~ **DONE (2026-03-16)**
7. Unified alerting policy and runbook
