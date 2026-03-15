# Deployment Gap Plan

Date: 2026-03-15

## Current deploy posture

### Backend
- Deployable as FastAPI service
- Gap: no strict production security envelope (auth/rate-limit/locked CORS)

### Web
- Deployable with Next.js build
- Optional Sentry plugin enabled via env

### Mobile
- EAS profiles present (`development`, `preview`, `production`)
- Needs full release checklist run + distribution ops

---

## Gaps to close before production

## G1 — Security baseline (IMPLEMENTED)
- [x] Add environment-based CORS restrictions (development/staging/production)
- [x] Add rate limiting middleware (configurable via RATE_LIMIT_REQUESTS/RATE_LIMIT_WINDOW)
- [x] Add API key authentication support (optional, via X-API-Key header)
- [x] Add security headers middleware (X-Content-Type-Options, X-Frame-Options, etc.)
- [ ] Deploy with production config and validate

**Implementation details:**
- ENVIRONMENT variable controls security posture: `development` | `staging` | `production`
- CORS: Open in dev, restricted in staging/prod (configurable via ALLOWED_ORIGINS)
- Rate limiting: Disabled in dev, active in staging/prod (100 req/60s default)
- Auth: Optional API_KEY env var enables X-API-Key header requirement
- Security headers: Always active, HSTS only in production

## G2 — Release gating (IMPLEMENTED)
- [x] Make lint/type gates strict in CI (removed continue-on-error from all lint/type checks)
- [x] Add smoke tests for backend critical flows (tests/test_smoke_backend.py)
- [x] Add smoke tests for web critical flows (web/tests/smoke.spec.ts with Playwright)
- [ ] Add rollback playbook

## G3 — Config/secret hygiene
- Required env validation at startup for each service
- Production secrets storage policy (no local-only secret assumptions)
- Separate dev/stage/prod config manifests

## G4 — Observability completeness
- Ensure Sentry release/env tags everywhere
- Add minimal product telemetry dashboards
- Add alert routing for critical failures

---

## Recommended release sequence
1. Backend hardening release
2. Web parity closure + observability release
3. Mobile stub completion + telemetry release
4. Unified release candidate and full matrix QA
5. Production rollout (staged)

---

## Practical checklist
- [x] Backend: auth/rate-limit/CORS restrictions
- [x] Web: parity-complete routes + graph parity + strict CI
- [x] Web: Search page added for feature parity
- [x] Mobile: quick-capture stubs removed + Sentry runtime enabled
- [x] Shared: smoke tests for backend (pytest) and web (Playwright)
- [ ] Shared: parity matrix updated and signed off
- [ ] Shared: incident + rollback docs ready
