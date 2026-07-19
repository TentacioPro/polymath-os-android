# Spec: Validation & Error Handling (aspect 5) — the error contract (Task 05)

## Two layers, one shape
- Client-side: schema validation (zod on web / TS validators on Expo) for immediate field-level
  feedback. Convenience only — never trusted.
- Backend: Pydantic re-validation on every request (exists in FastAPI models; extend, don't
  duplicate). The only layer that counts.

## The error payload (every non-2xx, no exceptions)
```json
{ "code": "validation_error | rbac_denied | guardrail_flag | guardrail_reject | not_found | conflict | internal",
  "details": [{ "path": ["field"], "message": "human-readable, actionable" }],
  "request_id": "uuid — correlates audit log + Opik trace" }
```

## Hard rules
1. `code` is a closed enum; adding a value is a spec change. Clients switch on `code`, never on
   message strings or status alone.
2. `details[].message` states what to DO, not just what failed ("name already exists — pick
   another" not "invalid input").
3. Guardrail outcomes surface with their evidence: a `guardrail_flag` response carries the named
   discrepancy (unsupported numbers, single-origin repetition…) so the UI can render the review
   card from ui-ux.spec.md rule 1.
4. `request_id` in every response, success included (api.spec.md contract rule).
5. No silent catch anywhere: an exception either becomes a contract-shaped response + audit
   entry, or it crashes loudly in dev. Swallowed errors are how the original drift happened.
