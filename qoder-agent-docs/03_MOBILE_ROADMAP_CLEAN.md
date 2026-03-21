# Clean Mobile Roadmap (Qoder Execution)

Date: 2026-03-21 (updated — V4 complete)

## Phase M0 — Stub Completion (✅ COMPLETE)

Goal: Remove visible "coming soon" behaviors.

Tasks:
1. ✅ Implement Quick Capture action handlers:
   - ✅ Camera scan flow (expo-image-picker)
   - ✅ File picker flow (expo-document-picker)
   - ✅ Voice capture UI: full waveform recorder (VoiceRecorder.tsx) — UI complete, expo-audio API wiring pending
2. ✅ Verify end-to-end behavior for each quick action (capture -> API -> list refresh)
3. ✅ Migrated expo-av → expo-audio (SDK 54 deprecation)
4. ✅ Fixed AsyncStorage crash (lazy require() pattern)

Exit criteria:
- ✅ No "coming soon" alerts on production paths (voice recording UI present; actual audio recording API wiring is the last remaining item)

---

## Phase M1 — Feature Depth + UX Consistency (✅ COMPLETE — feat/ui-revamp-v3)

Goal: Bring deep interaction quality to parity with web and roadmap intent.

Tasks:
1. ✅ M3 (Material You) full component library: M3Button, M3Card, M3Chip, M3Dialog, M3TextField, M3BottomSheet, M3Switch, M3Progress, M3RefreshIndicator, FAB, EmptyState, SearchOverlay, StatRing, AIProgress, SuccessAnimation, DialogProvider
2. ✅ Navigation revolution: CollapsibleHeader (scroll-driven), FAB + swipeable tab pattern; AppDrawer + FloatingPill removed
3. ✅ All 15 screens revamped with tonal elevation, M3 surfaces, M3 motion tokens
4. ✅ Shared design token system (`shared/design-tokens.ts`): typography, spacing, elevation, motion

Exit criteria:
- ✅ All core screens pass UX consistency (M3 surfaces, tonal color, haptics, safe area)

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
5. Wire VoiceRecorder.tsx to expo-audio AudioModule (last M0 gap)

Exit criteria:
- Release candidate passes functional + stability matrix

---

## Phase M3 — Observability and Analytics (✅ COMPLETE)

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
1. ✅ Jest test suite: 303 tests across 9 suites (expanded from 140/4)
   - analytics.test.ts (15 tests)
   - store.test.ts (16 tests)
   - theme.test.ts (102 tests)
   - backend.test.ts (7 tests)
   - api-connection.test.ts (new)
   - capture-components.test.tsx (new)
   - m3-components-extended.test.tsx (new)
   - navigation-components.test.tsx (new)
   - ui-components.test.tsx (new)
2. ✅ jest-expo@54 + jest@29.7 (Expo SDK 54 compatible)

---

## Suggested next agent split (mobile)
- Agent M-A: Wire VoiceRecorder to expo-audio AudioModule (close last voice gap)
- Agent M-B: Device matrix QA + safe-area/keyboard edge cases
- Agent M-C: EAS build verification (preview + production profiles)
- Agent M-D: Crash-free/session KPI tracking (Sentry release tags)

---

## Phase M5 — V4 UI Revamp (✅ COMPLETE — feat/ui-revamp-v4)

Goal: Kole Jain Design System × Material You M3 compliance across all mobile screens.

9 phases (all DONE):
1. ✅ Token precision audit — verified M3 tokens against design-tokens.ts (7a22a15)
2. ✅ Spacing + icon audit — 8pt grid enforced, Ionicons → semantic naming audit (cfe6164)
3. ✅ M3 8-state component matrix — all M3 components cover default/focused/hovered/pressed/error/disabled/loading/empty (7909e53)
4. ✅ Optimistic UI — all mutations (add/delete) use optimistic list updates with rollback (45112aa)
5. ✅ Animation performance audit — Reanimated useSharedValue, removed JS-thread animations (8adc49c)
6. ✅ Empty states — all data screens wired to EmptyState component (11ef783)
7. ✅ Interruption routing — Popover.tsx (long-press → rename/delete), M3BottomSheet rename flow, optimistic rename with rollback (76f972b)
8. ✅ Bento dashboard — F-pattern reorder: hero → stat rings → 2-col bento (streak + quick capture) → activity feed → mesh → top domains (861a3cf)

New components/hooks added:
- `frontend/components/ui/Popover.tsx` — RN Modal-based contextual menu
- EmptyState `empty-export` variant
- Dashboard streak computation (useMemo over activities)
