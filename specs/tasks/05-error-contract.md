# 05 — Error Contract Module

## GOAL
Create `backend/error_contract.py` implementing the closed error-code enum and standard response
shape from `validation-error-handling.spec.md`. Wire FastAPI exception handlers in `server.py`
so every non-2xx response emits the contract shape. `request_id` must appear in every response
(success and error). After this task, no non-2xx response exits the backend without a contract-
shaped body; no silent catches exist.

## MODULE SPECS
- `specs/modules/validation-error-handling.spec.md` — the definitive contract (closed enum, shape,
  hard rules 1-5)
- `specs/modules/observability.spec.md` rule 1 (request_id correlates audit ↔ Opik ↔ error)
- `reference/scaffold/specs/api.spec.md` (request_id in every response, success included)

## REUSE MAP
**Authoritative source (verified on disk):**
- `reference/scaffold/backend/src/middleware/validateRequest.js` — scaffold validation middleware
  pattern
- `backend/guardrails.py` — `format_error_response()` already produces the guardrail shape; this
  task generalises it to all error codes

**Closed error code enum (validation-error-handling.spec.md):**
```python
class ErrorCode(str, Enum):
    VALIDATION_ERROR = "validation_error"
    RBAC_DENIED = "rbac_denied"
    GUARDRAIL_FLAG = "guardrail_flag"
    GUARDRAIL_REJECT = "guardrail_reject"
    NOT_FOUND = "not_found"
    CONFLICT = "conflict"
    INTERNAL = "internal"
```

**Standard response shape:**
```python
@dataclass
class ErrorDetail:
    path: list[str]
    message: str

@dataclass
class ErrorResponse:
    code: ErrorCode
    details: list[ErrorDetail]
    request_id: str
```

**Constructor:**
```python
def make_error(
    code: ErrorCode,
    message: str,
    path: list[str] = None,
    request_id: str = None,
    extra_details: list[ErrorDetail] = None,
) -> dict: ...
```

## FASTAPI EXCEPTION HANDLERS
Wire in `server.py`'s lifespan / app setup (not inline in routes):

| Exception | Code | Status |
|---|---|---|
| `RequestValidationError` (Pydantic) | `validation_error` | 422 |
| `HTTPException` with status 401 | `rbac_denied` | 401 |
| `HTTPException` with status 403 | `rbac_denied` | 403 |
| `HTTPException` with status 404 | `not_found` | 404 |
| `HTTPException` with status 422 (guardrail) | preserve detail code | 422 |
| `HTTPException` with status 409 | `conflict` | 409 |
| `Exception` (catch-all) | `internal` | 500 |

**Key rule**: when `HTTPException.detail` is already a dict with `"code"` key (emitted by
guardrails or RBAC), pass it through unchanged — do not re-wrap. Only re-wrap plain string details.

**request_id propagation**: every handler reads `request.state.request_id` if set, else generates
a fresh uuid. The middleware must set `request.state.request_id` at request entry so all handlers
can use it. This same id goes into the audit log (T04) and any Opik trace (T08).

## TDD CONTRACT
**Unit tests** (`backend/tests/test_error_contract.py` — no live server, pure logic):

1. `test_error_code_enum_is_closed` — ErrorCode has exactly the 7 listed values; adding a value
   is detectable (asserts `len(ErrorCode) == 7`)
2. `test_make_error_shape` — `make_error(VALIDATION_ERROR, "name required", ["body","name"],
   "req-001")` returns `{"code": "validation_error", "details": [...], "request_id": "req-001"}`
3. `test_make_error_details_is_list` — `details` is always a list even for single message
4. `test_make_error_generates_request_id_if_none` — when request_id is None, a uuid4 is generated
5. `test_rbac_denied_error_shape` — `make_error(RBAC_DENIED, "insufficient role: agent:read_only",
   ["header","Authorization"])` has code="rbac_denied"
6. `test_guardrail_passthrough_not_rewrapped` — if detail is already `{"code": "guardrail_reject",
   ...}`, the handler returns it unchanged (no double-wrapping)
7. `test_no_silent_catch_in_error_contract` — AST check: `error_contract.py` contains no bare
   `except: pass` or `except Exception: pass` without a re-raise or explicit logging call

**Integration** (existing 22-test suite must still pass):
- All non-2xx responses from existing routes now carry the contract shape.
- Public endpoints (GET /activities, GET /journals, etc.) return 200 with `request_id` header or
  body field (spec rule 4 — request_id in every response).

## GUARDRAIL-PROVENANCE
- ErrorCode enum: closed set from `validation-error-handling.spec.md` hard rule 1.
- Passthrough rule for already-shaped details: prevents double-wrapping of guardrail + RBAC
  errors that T02/T03 already format correctly.
- request_id middleware: prerequisite for T08's Opik trace correlation.

## FILE SCOPE
ONLY these paths may be modified:
- `backend/error_contract.py` (new)
- `backend/tests/test_error_contract.py` (new)
- `backend/server.py` — ONLY to add `@app.exception_handler(...)` registrations and a
  `request_id` middleware. No route logic changes.
- `specs/tasks/05-error-contract.state.md`
- `specs/tasks/05-error-contract-decisions.md`

## OUT OF SCOPE
- Frontend error display (no frontend changes)
- Client-side zod validation (already exists; not touched)
- Sentry wiring (observability.spec.md rule 3 — separate task)
- Changing existing route responses that already return 2xx

## PARALLEL SAFETY
T05 touches `server.py` (exception handlers + middleware). T04 also touches `server.py` (import
swap). T04 must merge first (T05 depends on `audit.py` existing for request_id in audit entries
generated by exception handlers). Do NOT run T04 and T05 in parallel.

## DONE MEANS
- `uv run pytest backend/tests/test_error_contract.py -v` — all 7 unit tests pass
- `uv run pytest tests/ -q` — all 22 integration tests still pass (with server+Mongo up)
- All non-2xx responses carry `{"code": ..., "details": [...], "request_id": "..."}` shape
- `05-error-contract-decisions.md` written: passthrough vs re-wrap decision, request_id
  middleware placement, catch-all handler rationale
- State file updated to `done`, branch pushed to `origin/task/05-error-contract`
- Merge gate: full suite on merge into `feat/ui-revamp-v4`
- **STOP LINE**: After this merge, write `specs/tasks/phase-1-report.md` summarizing all T01-T05
  state files + metrics, push to `feat/ui-revamp-v4`, end the queue.
