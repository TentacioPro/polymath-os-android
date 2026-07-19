# 05-error-contract-decisions.md
*Written 2026-07-19 after implementation. Append-only.*

---

## Decision 1: Passthrough for already-shaped dicts (no double-wrapping)

**Chosen:** `is_already_shaped(detail)` returns True when `detail` is a dict with `"code"` and
`"details"` keys. The `HTTPException` handler checks this before re-wrapping, so guardrail
(422, `guardrail_reject`) and RBAC (403, `rbac_denied`) errors that T02/T03 already format
correctly pass through unchanged.

**Rejected:** Always re-wrapping `exc.detail` — would produce nested `{"code": "internal",
"details": [{"message": '{"code": "guardrail_reject", ...}'}]}` for already-shaped errors,
breaking client switch-on-code logic.

**Why `is_already_shaped` and not isinstance check:** The shaped dict comes from `format_error_response`
in guardrails.py (returns a plain dict, not a typed class). An isinstance check against a class
would require importing from multiple modules. A duck-type check on required keys is simpler and
matches what clients actually depend on.

---

## Decision 2: request_id middleware — HTTP middleware, not a Depends

**Chosen:** `@app.middleware("http")` sets `request.state.request_id` once per request before
any route handler runs. The response also sets the `x-request-id` header so clients can correlate
without parsing the body.

**Rejected:** FastAPI `Depends` for request_id — would require adding the dependency to every
route. Middleware runs unconditionally on every request and response.

**Why `x-request-id` header as fallback input:** If a client sets `x-request-id` in the request
header (standard pattern from API gateways), we use that id so the entire chain (client → gateway
→ backend → audit → Opik) uses the same id. If not set, we generate a fresh uuid4.

---

## Decision 3: Generic Exception handler (catch-all 500)

**Chosen:** `@app.exception_handler(Exception)` is registered as a catch-all. It logs the full
traceback with `exc_info=True` and returns a contract-shaped 500 response. This satisfies
validation-error-handling.spec.md hard rule 5 ("no silent catch anywhere").

**Rejected:** Not registering a catch-all — FastAPI's default 500 handler returns a plain
`{"detail": "Internal Server Error"}` string that violates the contract shape. Clients switching
on `code` would fail.

**Why log and return (not re-raise):** In a FastAPI ASGI context, re-raising causes a 500 to be
returned with FastAPI's default handler anyway, but loses the contract shape. The spec says
"crashes loudly in dev" — the `logging.error(exc_info=True)` satisfies this (stack trace in logs).

---

## Decision 4: HTTP status → ErrorCode mapping

**Chosen:** Direct mapping in the handler:
- 401 → `rbac_denied` (unauthenticated access attempt)
- 403 → `rbac_denied` (authenticated but insufficient role)
- 404 → `not_found`
- 409 → `conflict`
- All other non-shaped → `internal`

**Rejected:** Separate 401 and 403 codes — the spec's closed enum does not have
`unauthenticated` vs `unauthorized`; both map to `rbac_denied` per the schema. Clients can
read the HTTP status for the 401 vs 403 distinction.

**422 passthrough:** 422 from guardrails is always already-shaped (T03 wires `format_error_response`
into the `detail`). The passthrough check catches it before the status-code mapping runs.

---

## Known gap: Integration gate blocked (same as T02/T03/T04)

**Finding (2026-07-19):** Integration gate requires live server + MongoDB.
Unit gate: 41/41 green (7 error_contract + 7 audit + 17 guardrails + 10 rbac).

**blocked_on:** live server + MongoDB — same block as previous tasks.
