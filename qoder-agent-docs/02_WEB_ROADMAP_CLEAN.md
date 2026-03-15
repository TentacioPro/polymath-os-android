# Clean Web Roadmap (Qoder Execution)

Date: 2026-03-15

## Phase W0 — Parity Closure (Immediate)

Goal: Close remaining mobile-vs-web feature gaps.

Tasks:
1. Add missing routes:
   - `/integrations`
   - `/customize`
2. Upgrade connections graph tab:
   - Replace list-like cards with true interactive graph visualization
3. Journal/search detail alignment:
   - Add journal detail route or refine search navigation semantics
4. Complete parity QA checklist across all shared pages

Exit criteria:
- Web route coverage equals mobile route coverage for product features
- No major UX deviation on high-frequency flows (dashboard, knowledge, chat, mesh, export)

---

## Phase W1 — Quality Hardening

Goal: Improve reliability and maintainability.

Tasks:
1. Resolve lint debt and enforce non-optional CI lint for web
2. Add route-level smoke tests (Playwright or equivalent)
3. Add API contract checks for key endpoints (health/stats/activities/journal/agent/chat)
4. Improve loading/empty/error consistency patterns across pages

Exit criteria:
- CI fails on real lint/type regressions
- Critical user flows have automated smoke coverage

---

## Phase W2 — Production Readiness

Goal: Ready for sustained public deployment.

Tasks:
1. Env hardening:
   - Strict required env validation at startup
2. Sentry quality:
   - release tags, environment tags, key user-flow breadcrumbs
3. Perf baseline:
   - capture route-level TTFB + hydration + interaction timings
4. Error boundary strategy:
   - page/module-level boundaries for key areas

Exit criteria:
- Production telemetry complete
- Release process documented and repeatable

---

## Phase W3 — Product Analytics & Insight

Goal: Add product telemetry beyond domain stats.

Tasks:
1. Instrument event taxonomy:
   - capture, search, export, connect, chat, journal create/update/delete
2. Add privacy-safe analytics provider
3. Build dashboard for funnel + retention + feature usage

Exit criteria:
- Product decisions can be made from usage data, not assumptions

---

## Suggested parallel agent split (web)
- Agent W-1: Route parity (`/integrations`, `/customize`, detail flow)
- Agent W-2: Graph visualization implementation
- Agent W-3: QA + tests + CI enforcement
- Agent W-4: Sentry + analytics instrumentation
