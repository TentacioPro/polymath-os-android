# 03-guardrails-port-decisions.md
*Written 2026-07-19 after implementation. Append-only.*

---

## Decision 1: Five scaffold-sourced checks (verbatim-in-spirit port)

**Source:** `reference/scaffold/agent-service/app/agent_layer/guardrails.py` (verified on disk;
scaffold agent-service suite 25/25 green before porting — confirmed 2026-07-19).

| Check | Outcome | Source |
|---|---|---|
| `check_quantified_claims` | FLAG | scaffold check 1 |
| `check_provenance_downgrade` | REJECT | scaffold check 2 |
| `check_cross_document_consistency` | FLAG | scaffold check 3 |
| `check_external_output_eligible` | REJECT | scaffold check 4 |
| `check_status_claim_against_later_evidence` | FLAG | scaffold check 5 |

**Rejected:** The original T03 spec named `length_and_format` and `pii_detection` as 4 checks.
These were WRONG — derived from spec prose without reading the scaffold source. Deviation #8 in
`00-environment-decisions.md` records the root cause (reference/scaffold/ never created during
Phase B rewrite). This decisions file records the correction.

---

## Decision 2: Provenance enum self-contained in backend/guardrails.py

**Chosen:** Define `Provenance` enum + `EXTERNAL_OUTPUT_ELIGIBLE` set directly in `guardrails.py`
rather than importing from agent-service (which has its own `app.data_layer.provenance` module).

**Rejected:** Importing from agent-service (cross-service dependency — backend must be independently
deployable; agent-service is a separate service per system-design.spec.md rule 4).

**Chosen subset:** Only the provenance levels used by the 5 checks are included
(`AI_GENERATED_UNVERIFIED`, `STRUCTURALLY_EVIDENCED`, `VERIFIED_ARTIFACT`, `USER_ATTESTED`,
`INFERENCE`). The full scaffold `_TRUST_ORDER` and `EXTERNAL_OUTPUT_ELIGIBLE` are ported verbatim.

---

## Decision 3: check_pii is spec-ADDED (not in scaffold)

**Rationale:** PII detection is a distinct concern from the hallucination-detection guardrails
in the scaffold. The spec (after owner amendment) adds `check_pii` as a named sixth check.
It enters via the extensibility mechanism: new check = file + register in `run_guardrails` +
tests — zero core edits. This is the living proof of the agentic-infra mapping decision
(00-spec-system.md §agentic-infra mapping 2026-07-19).

**PII regex patterns and sources:**

| Pattern | Regex | Source |
|---|---|---|
| Email | `\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b` | RFC 5322 simplified — strips obsolete forms for readability |
| Phone (US) | `\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b` | E.164 adjacent; covers NANP formats with optional country code |
| SSN | `\b\d{3}-\d{2}-\d{4}\b` | SSN canonical format (Social Security Administration) |
| Credit card | `\b(?:\d[ -]?){13,16}\b` | Broad Luhn-range pattern; intentionally broad — see false-positive note |

**False-positive risk:** The credit-card pattern is intentionally broad (13-16 digits with optional
separators). It will match any 13-16 digit number string. In practice: long numeric IDs in content
will flag. Accepted trade-off: false-positive flagging is safer than false-negative miss for
financial data. A Luhn-check can be added as a follow-up if false-positive rate is unacceptable.

**Rejected:** OWASP Input Validation Cheat Sheet regex for email — too permissive for production
(allows internationalized domains without explicit handling). Chose RFC 5322 simplified per
common Python practice.

---

## Decision 4: FLAG-class never blocks; REJECT-class always enforces where wired

**Chosen:** `run_guardrails()` returns `list[GuardrailResult]` — never raises. The route handler
(in server.py's `guardrails_content_check` Depends) inspects outcomes:
- REJECT → raises HTTPException 422 with `guardrail_reject` shape
- FLAG → annotates `request.state.guardrail_flags` for audit (T04 reads this); request proceeds
- PASS → no action

**Rejected:** Blocking on FLAG (would break user experience for legitimate borderline content;
FLAG is defined as "surfaced for review, not auto-rejected" in spec and scaffold docstring).
Rejected: raising inside `run_guardrails` (violates composability contract from test 16).

---

## Decision 5: No permissive/bypass mode — enforcement identical in dev and prod

**Chosen:** guardrails.py contains no env reads (not even for configuration). All thresholds and
pattern sets are module-level constants. The AST-based bypass test (test 17) verifies this
structurally — not via word-grep.

**Rejected:** "dev mode skips guardrails" — same argument as T02: security layers must be
unconditional. The smoke tests are affected the same way as T02's RBAC (unauthenticated mutation
requests) — the integration gate is shared and blocked on the same auth fixture gap.

**Why AST, not word-grep:** mirrors T02's Decision 8. Word-grep catches docstring vocabulary.
AST catches actual code paths. Comments in guardrails.py may freely describe what the check is
doing without triggering a false assertion failure.

---

## Decision 6: cross_document_consistency trigger precision

**Spec amendment (owner, 2026-07-19):** trigger language updated from "same claim sourced from
documents that contradict each other" to "same claim repeated across documents tracing to a SINGLE
origin — repetition is not corroboration." The contradiction framing belonged to check 5 only.
The scaffold implementation confirms: `len(claim_sources) > 1 and len(unique_origins) == 1` is
the literal condition — single origin, multiple documents, not contradiction.

---

## Decision 7: Original 4-check mis-spec correction (recorded per spec requirement)

**What was wrong:** The original T03 spec named:
- `length_and_format` (REJECT) — NOT in scaffold
- `unsupported_numbers` (FLAG) — conflated with `check_quantified_claims`
- `single_origin_repetition` (FLAG) — approximation of `check_cross_document_consistency`
- `pii_detection` (FLAG/REJECT) — NOT in scaffold

**Root cause:** `reference/scaffold/` did not exist when T03 was first written (Deviation #8).
Spec was derived from `validation-error-handling.spec.md` prose, not scaffold source.

**Correct checks (5, from scaffold + 1 spec-added):** As in Decision 1 above. The scaffold has
no `length_and_format` or `pii_detection` checks. `check_pii` is added by spec authority
(Decision 3). `length_and_format` has no equivalent — request body size limits are handled at the
HTTP layer (server.py's `RequestSizeLimitMiddleware`), not in content guardrails.

---

## Known gap: Integration gate blocked (same as T02)

**Finding (2026-07-19):** The 22 smoke tests make unauthenticated requests. The
`guardrails_content_check` Depends does not require auth (it's a content check, not an access
check), so guardrail wiring itself won't break unauthenticated tests. However, the integration
tests require a live server + MongoDB.

**T03 integration gate:** `gate_pending` — server not available in this session.
Same auth-fixture gap as T02 (tracked in T02 decisions file).

**blocked_on:** live server + MongoDB for the 22 integration tests.
