# Synchronization Plan (Mobile ↔ Web ↔ Backend)

Date: 2026-03-15

## Objective
Keep feature and behavior parity between clients while backend evolves.

## Sync pillars

### 1) API Contract Sync
- Define canonical endpoint contract doc from backend routes
- Add contract tests for:
  - activities CRUD
  - journals CRUD
  - agent chat/stats/persona
  - connections/suggestions
  - search/notifications
  - export/import

### 2) Feature Parity Matrix
Maintain one source of truth table with statuses:
- `Not Started`
- `In Progress`
- `Implemented`
- `Implemented + QA`

Required rows:
- each user-facing feature (not endpoint)
- columns: mobile, web, backend, QA owner

### 3) Design Token Sync
- Keep theme token definitions aligned (all 7 themes)
- Add parity checklist for page-level token usage
- Use screenshot-based comparison for key screens

### 4) Release Cadence Sync
- Weekly parity checkpoint
- Frozen API branch window before release
- “No merge without parity matrix update” rule

---

## Operating model for Qoder agents

### Daily
- Agent leads post delta updates in one shared handoff file
- Rebase from main before large UI changes

### Per PR
- Update parity matrix row(s)
- Include before/after screenshots for UI work
- Include API endpoint touch list for backend work

### Weekly
- Run parity review:
  - route inventory compare (web vs mobile)
  - open mock/stub list review
  - open security/observability debt review

---

## Current high-priority sync gaps
1. ~~Web missing `/integrations` + `/customize`~~ **DONE (2026-03-15)**
2. ~~Connections graph behavior mismatch~~ **DONE (2026-03-15)** - Interactive force-directed graph implemented
3. ~~Mobile quick capture stubs~~ **DONE (2026-03-15)** - File/Scan implemented, Voice permission-ready
4. ~~Mobile Sentry runtime not fully integrated~~ **DONE (2026-03-15)**
5. ~~No shared product analytics taxonomy~~ **DONE (2026-03-15)** - Event taxonomy defined, tracking utilities created
6. ~~Empty states inconsistent / missing on data screens~~ **DONE (2026-03-21)** - All 6 web + all mobile data screens wired to EmptyState component
7. ~~No activity rename UX on either platform~~ **DONE (2026-03-21)** - Web: three-dot Popover + inline rename; Mobile: long-press Popover + bottom sheet rename
8. ~~Dashboard layout not following F-pattern~~ **DONE (2026-03-21)** - Mobile bento F-pattern (streak + quick-capture row); Web 12-col bento grid
9. ~~No Popover / non-blocking contextual menu component~~ **DONE (2026-03-21)** - `Popover.tsx` added for both web and mobile
10. ~~No optimistic UI for rename mutations~~ **DONE (2026-03-21)** - useUpdateActivity hook with optimistic update + rollback on both platforms
