# Incremental Roadmap (aspect 11) — parallel lanes over the task ledger

Phases are USABILITY milestones; inside each, lanes run in parallel (disjoint FILE SCOPEs,
spec-system §C). You start using the system at the end of every phase, not at the end.

## Phase 0 — Foundation (serial, ~1 session)
T01: fix 7 stale Jest tests (4 theme-identity + 3 CollapsibleHeader). Fast-forward to main REMOVED — trunk is feat/ui-revamp-v4 (see 00-environment-decisions.md §4).
T09a: design-language token layer (soft-minimal, typography-led). Runs before T09.
✔ Usable: green baseline on the real trunk; design language locked.

## Phase 1 — Security surface (2 lanes, parallel)
Lane A: T02 RBAC port (+ JWT-secret hard-fail)   Lane B: T03 guardrails port
Then serialized: T04 audit extraction+extension (touches server.py — cannot parallel with A/B),
T05 error contract.
✔ Usable: every request checked, denied-with-reason, auditable end to end.

## Phase 2 — Data truth (2 lanes)
Lane A: T06 Mongo→Kùzu/LanceDB migration (encryption carried, provenance assigned)
Lane B: T07 GraphStore wiring (red test → green)
✔ Usable: your existing data, in the provenance-aware graph, queryable.

## Phase 3 — First agent loop (2 lanes)
Lane A: T08 orchestrator + journal-capture (Habit ← CiggTrack semantics)
Lane B: T09 client screens (journal capture + staging confirmation, both platforms)
✔ Usable: THE core loop — speak/type your day, agent stages, you confirm, graph grows. This is
the earliest point the system does what it exists for. Daily use starts here.

## Phase 4 — Durability + breadth (3 lanes)
Lane A: T10 Vault (backup.sh heritage + restore drill)
Lane B: T11 notebook-ingest agent (books/PDFs — ReadingItem honesty: downloaded ≠ read)
Lane C: T12 metacognitive-review agent (inference provenance, derived_from mandatory)
✔ Usable: documents flow in; the system starts reflecting patterns back — with receipts.

## Phase 5 — Outward + ambient (lanes as capacity allows)
T13 resume/cover-letter (provenance-gated; reuse YOUR SlideCV for visual output; career-ops fork
as pipeline reference) · T14 curriculum/learning agent — scope: LearningItem tracking for
courses (deeplearning.ai — July-2026---DL is the first live target), blogs, and the YouTube
playlist backlog (claude-video fork = ingestion reference); mastery/spaced-repetition UI
concepts from YOUR polymath-os "Archivist" · T15 CUA importer (staged; browser-harness fork =
control reference; linkwarden pattern for bookmarks; wacli for WhatsApp links) · T16 voice
interface (the JARVIS moment) · T17 mail-agent (Gmail; see ledger) · T18 memory manager
(memory.spec.md) — consider pulling into Phase 4 if daily use makes context-carry painful ·
T19 polymath-mcp + OKF export (interop.spec.md) · T20 docs-site (MkDocs Material → GitHub Pages,
low priority, markdown-in-git stays canonical) · Shepherd runtime adoption when mature.

## Rules
1. A phase ends when its ✔ line is true in daily use, not when code merges.
2. Parallel ≤ your real capacity: 2 agent lanes + you reviewing is the sustainable default;
   3 only when scopes are trivially disjoint. WIP limits beat heroics.
3. Ledger numbers T11+ get full task specs (template) before any agent starts them.
