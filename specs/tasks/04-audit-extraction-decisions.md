# 04-audit-extraction-decisions.md
*Written 2026-07-19 after implementation. Append-only.*

---

## Decision 1: init_db() injection pattern (no circular import)

**Chosen:** `audit.py` exposes `init_db(db)` — called once in the `@app.on_event("startup")`
handler after the Motor client is initialized. All 9 existing `log_audit_event` callers in
`server.py` remain unchanged (no new kwargs required).

**Rejected:** Accepting `db` as a kwarg on `log_audit_event` — would require touching all 9
call sites for zero behavioral gain. Rejected: `from database import db` in `audit.py` — no
`database.py` module exists; `db` is a module-level global in `server.py`. A `from server import db`
would create a circular import (server imports audit, audit imports server).

**Why `_db = None` guard:** if `init_db` is not called (e.g. in unit tests), the write is skipped
silently. Unit tests set `audit_module._db = mock_db` directly. This is the same pattern as
many FastAPI DB injection examples and matches the existing `log_audit_event` error-swallowing
contract.

---

## Decision 2: Backwards-compatible schema extension (new fields Optional + defaults)

**Chosen:** All new scaffold-sourced fields (`actor`, `resource`, `result`, `denial_reason`,
`request_id`) are added as `Optional[str]` with safe defaults. Existing Mongo documents that
predate T04 lack these fields — Pydantic returns `None` on read, and the collection remains
queryable without a migration.

**Rejected:** Requiring all new fields (non-Optional) — would break deserialization of
pre-existing audit documents. Rejected: running a Mongo migration script — out of scope for T04,
adds deployment risk with no benefit (append-only means the old entries are still valid history).

---

## Decision 3: `result` derived from `success` bool

**Chosen:** If `result` kwarg is not passed, derive it: `"success" if success else "denied"`.
This covers all existing callers (which pass `success=True/False` but not `result`).

**Edge case:** `result="error"` (for 5xx-class failures) requires the caller to pass it
explicitly — the bool alone cannot distinguish "denied" from "error". The derive rule is:
`False → "denied"` unless the caller says otherwise. For internal errors, callers should
pass `result="error"` explicitly. Existing callers don't currently distinguish — accepted
as a known limitation until T05 wires exception handlers that can set this more precisely.

---

## Decision 4: `denial_reason` auto-populated from request.state (T02 integration)

**Chosen:** `log_audit_event` reads `request.state.audit_denial_reason` if `denial_reason`
kwarg is not passed. This is set by T02's `check_permission` function before every 403 raise.
Zero changes required in existing `log_audit_event` callers — the denial reason propagates
automatically for any route that uses `require_permission`.

**Why not a middleware?** A middleware would need to intercept after-response events and still
be able to correlate the reason to the audit entry. The request.state approach is simpler and
directly couples the two without introducing ordering dependencies.

---

## Decision 5: `resource` composed as "type:id" (scaffold pattern)

**Chosen:** Port the scaffold's `resource: req.path` concept adapted to our resource model.
Since we have typed resources (`resource_type` + optional `resource_id`), compose them as
`f"{resource_type}:{resource_id}"` when id is present, else just `resource_type`.

This gives audit log readers one field to query: `db.audit_logs.find({"resource": "journal:abc"})`.

**Rejected:** Keeping `resource_type` and `resource_id` as separate fields for the `resource`
column — the scaffold uses a single `resource` string for the "one-query weekly answer" hard rule 4.
Both are kept in the document (backward-compat) AND the composed `resource` field is added.

---

## Known gap: Integration gate blocked (same as T02/T03)

**Finding (2026-07-19):** Integration gate requires live server + MongoDB. Unit gate is 7/7 green.
The migration (replacing inline code with import) is structural only — behavior is identical.

**blocked_on:** live server + MongoDB — same block as T02/T03.
