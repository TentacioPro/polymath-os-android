# Clean Mobile Roadmap (Qoder Execution)

Date: 2026-03-16

## Phase M0 — Stub Completion (✅ COMPLETE)

Goal: Remove visible "coming soon" behaviors.

Tasks:
1. ✅ Implement Quick Capture action handlers:
   - ✅ Camera scan flow (expo-image-picker)
   - ✅ File picker flow (expo-document-picker)
   - Voice capture flow (placeholder — requires full recording UI)
2. ✅ Verify end-to-end behavior for each quick action (capture -> API -> list refresh)
3. ✅ Migrated expo-av → expo-audio (SDK 54 deprecation)
4. ✅ Fixed AsyncStorage crash (lazy require() pattern)

Exit criteria:
- ✅ No "coming soon" alerts on production paths (except voice recording)

---

## Phase M1 — Feature Depth + UX Consistency

Goal: Bring deep interaction quality to parity with web and roadmap intent.

Tasks:
1. Strengthen agent management UX (memory actions where needed)
2. Standardize error/loading/empty patterns across all stack screens
3. Validate navigation transitions and safe-area behavior on all major screen classes

Exit criteria:
- All core screens pass UX consistency checklist

---

## Phase M2 — Device QA + Release Stability

Goal: Production stability on Android distribution path.

Tasks:
1. Device matrix QA:
   - low-end Android
   - modern Android
   - tablet form factor
2. Offline/poor-network behavior audit
3. Background/resume session behavior tests
4. EAS pipeline verification (preview + production profiles)

Exit criteria:
- Release candidate passes functional + stability matrix

---

## Phase M3 — Observability and Analytics (✅ MOSTLY COMPLETE)

Goal: Fill telemetry gap on mobile runtime.

Tasks:
1. ✅ Activate runtime Sentry integration (`@sentry/react-native`) with env gates
2. ✅ Add privacy-safe product events for key actions (utils/analytics.ts)
3. Add crash-free/session-level release KPI tracking

Exit criteria:
- Mobile observability equals web/backend observability maturity

---

## Phase M4 — Testing (✅ COMPLETE)

Tasks:
1. ✅ Jest test suite: 140 tests across 4 files
   - analytics.test.ts (15 tests)
   - store.test.ts (16 tests)
   - theme.test.ts (102 tests)
   - backend.test.ts (7 tests)
2. ✅ jest-expo@54 + jest@29.7 (Expo SDK 54 compatible)

---

## Suggested parallel agent split (mobile)
- Agent M-1: Quick Capture implementations (voice/scan/file)
- Agent M-2: QA matrix + navigation/safe-area fixes
- Agent M-3: Sentry RN integration + telemetry events
- Agent M-4: UX consistency pass across all stack routes
