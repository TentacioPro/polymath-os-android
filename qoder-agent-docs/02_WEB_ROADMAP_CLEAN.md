# Clean Web Roadmap (Qoder Execution)

Date: 2026-03-21 (updated — V4 complete)

## Phase W0 — Parity Closure (✅ COMPLETE)

Goal: Close remaining mobile-vs-web feature gaps.

Tasks:
1. ✅ Add missing routes: `/integrations`, `/customize`
2. ✅ Upgrade connections graph tab (force-directed interactive graph)
3. Journal/search detail alignment — in progress
4. ✅ Complete parity QA checklist across all shared pages

Exit criteria:
- ✅ Web route coverage equals mobile route coverage for product features
- ✅ No major UX deviation on high-frequency flows

---

## Phase W-V4 — V4 UI Revamp (✅ COMPLETE — feat/ui-revamp-v4)

Goal: Kole Jain Design System × Material You M3 compliance across all 15 web routes.

9 phases (all DONE):
1. ✅ Token precision audit (Phase 0 — 7a22a15)
2. ✅ Spacing + icon audit — 8pt grid, Material Symbols (Phase 1 — cfe6164)
3. ✅ M3 8-state component matrix (Phase 2 — 7909e53 + d29b262)
4. ✅ Optimistic UI — useOptimisticList, useUpdateActivity (Phase 3 — 45112aa)
5. ✅ Container queries — component-level, bento grid (Phase 4 — da686eb)
6. ✅ Animation performance audit (Phase 5 — 8adc49c)
7. ✅ Empty states — all 6 data screens wired (Phase 6 — 11ef783)
8. ✅ Interruption routing — Popover three-dot menu, inline rename (Phase 7 — 76f972b)
9. ✅ Bento dashboard — 12-col web grid (Phase 8 — da686eb)

---

## Phase W1 — Quality Hardening

Goal: Improve reliability and maintainability.

Tasks:
1. Resolve lint debt and enforce non-optional CI lint for web
2. Add route-level smoke tests (Playwright or equivalent)
3. Add API contract checks for key endpoints (health/stats/activities/journal/agent/chat)
4. ✅ Improve loading/empty/error consistency patterns across pages (done — Phase 6 V4)

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
