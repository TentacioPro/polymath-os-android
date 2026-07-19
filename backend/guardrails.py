"""
Anti-hallucination guardrails — T03.
Source: ported from reference/scaffold/agent-service/app/agent_layer/guardrails.py

Five scaffold checks + one spec-added check (check_pii).
No env-based bypass, permissive mode, or development shortcut exists here.
Enforcement is identical in dev and prod.

FLAG-class outcomes annotate but never block the request.
REJECT-class outcomes enforce (route handler raises HTTPException).
run_guardrails() returns list[GuardrailResult] — never raises — so the
route handler decides how to handle each outcome.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


# ── Core types (ported verbatim from scaffold) ────────────────────────────────

class GuardrailOutcome(str, Enum):
    PASS = "pass"
    FLAG = "flag"     # surfaced to the user for review, not auto-rejected
    REJECT = "reject"  # hard stop, logged as a denial


@dataclass
class GuardrailResult:
    outcome: GuardrailOutcome
    reason: str = ""
    details: dict = field(default_factory=dict)


# ── Provenance enum (self-contained for backend — no agent-service dep) ───────

class Provenance(str, Enum):
    USER_ATTESTED = "user_attested"
    VERIFIED_ARTIFACT = "verified_artifact"
    STRUCTURALLY_EVIDENCED = "structurally_evidenced"
    AI_GENERATED_UNVERIFIED = "ai_generated_unverified"
    INFERENCE = "inference"


# Trust order: lower index = less trusted (used by check_provenance_downgrade)
_TRUST_ORDER = [
    Provenance.AI_GENERATED_UNVERIFIED,
    Provenance.STRUCTURALLY_EVIDENCED,
    Provenance.VERIFIED_ARTIFACT,
]

# Only these levels may reach external output (resume / cover-letter agents)
EXTERNAL_OUTPUT_ELIGIBLE = {Provenance.USER_ATTESTED, Provenance.VERIFIED_ARTIFACT}


# ── Number pattern (ported verbatim from scaffold) ────────────────────────────

_NUMBER_PATTERN = re.compile(
    r"\b\d{1,3}(?:\.\d+)?%|\$[\d,]+(?:\.\d+)?|\b\d{2,}\+?\s?(?:users|concurrent)"
)


# ── PII patterns (spec-added — not in scaffold) ───────────────────────────────
# Sources: RFC 5322 simplified email, E.164-adjacent US phone, SSN, broad card
# pattern. See 03-guardrails-port-decisions.md for per-pattern citation.

_PII_PATTERNS: list[tuple[str, re.Pattern]] = [
    (
        "email",
        re.compile(r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b"),
    ),
    (
        "phone_us",
        re.compile(r"\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b"),
    ),
    (
        "ssn",
        re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
    ),
    (
        "credit_card",
        re.compile(r"\b(?:\d[ -]?){13,16}\b"),
    ),
]


# ── Five scaffold checks ──────────────────────────────────────────────────────

def check_quantified_claims(output_text: str, source_text: str) -> GuardrailResult:
    """Check 1 (FLAG): output contains a specific number not present in source."""
    output_numbers = set(_NUMBER_PATTERN.findall(output_text))
    source_numbers = set(_NUMBER_PATTERN.findall(source_text))
    unsupported = output_numbers - source_numbers
    if unsupported:
        return GuardrailResult(
            outcome=GuardrailOutcome.FLAG,
            reason="output contains quantified claims not found in source material",
            details={"unsupported_numbers": sorted(unsupported)},
        )
    return GuardrailResult(outcome=GuardrailOutcome.PASS)


def check_provenance_downgrade(claimed: Provenance, actual: Provenance) -> GuardrailResult:
    """Check 2 (REJECT): output claims higher provenance than source supports."""
    if (
        claimed in _TRUST_ORDER
        and actual in _TRUST_ORDER
        and _TRUST_ORDER.index(claimed) > _TRUST_ORDER.index(actual)
    ):
        return GuardrailResult(
            outcome=GuardrailOutcome.REJECT,
            reason=f"output claims provenance '{claimed.value}' but source only supports '{actual.value}'",
        )
    return GuardrailResult(outcome=GuardrailOutcome.PASS)


def check_cross_document_consistency(claim_sources: list[str]) -> GuardrailResult:
    """Check 3 (FLAG): same claim repeated across documents tracing to a SINGLE
    origin — repetition is not corroboration (artificial inflation via same-session-origin)."""
    unique_origins = set(claim_sources)
    if len(claim_sources) > 1 and len(unique_origins) == 1:
        return GuardrailResult(
            outcome=GuardrailOutcome.FLAG,
            reason="claim repeated across documents but traces to a single origin — not independently verified",
            details={"origin": next(iter(unique_origins)), "repeat_count": len(claim_sources)},
        )
    return GuardrailResult(outcome=GuardrailOutcome.PASS)


def check_external_output_eligible(provenance: Provenance) -> GuardrailResult:
    """Check 4 (REJECT): content destined for external output must be user_attested
    or verified_artifact — no exceptions."""
    if provenance not in EXTERNAL_OUTPUT_ELIGIBLE:
        return GuardrailResult(
            outcome=GuardrailOutcome.REJECT,
            reason=f"provenance '{provenance.value}' is not eligible for external output",
        )
    return GuardrailResult(outcome=GuardrailOutcome.PASS)


def check_status_claim_against_later_evidence(
    status_claim: str,
    status_date: str,
    contradicting_doc_date: str,
    contradicting_doc_summary: str,
) -> GuardrailResult:
    """Check 5 (FLAG): status claim contradicted by a later, more specific document.
    Permanent regression test: Oct 2025 AWS resume vs Nov 2025 GCP re-derivation."""
    if contradicting_doc_date > status_date:
        return GuardrailResult(
            outcome=GuardrailOutcome.FLAG,
            reason="status claim is contradicted by a later, more specific document",
            details={
                "claim": status_claim,
                "claim_date": status_date,
                "contradicting_date": contradicting_doc_date,
                "contradicting_summary": contradicting_doc_summary,
            },
        )
    return GuardrailResult(outcome=GuardrailOutcome.PASS)


# ── Spec-added check (check_pii) ──────────────────────────────────────────────

def check_pii(content: str, mode: str = "flag") -> GuardrailResult:
    """Spec-added check (not in scaffold): detect PII patterns.
    mode='flag' → FLAG outcome; mode='reject' → REJECT outcome.
    See 03-guardrails-port-decisions.md for regex sources and false-positive notes."""
    found: list[dict] = []
    for pii_type, pattern in _PII_PATTERNS:
        matches = pattern.findall(content)
        if matches:
            found.append({"type": pii_type, "count": len(matches)})

    if found:
        outcome = GuardrailOutcome.REJECT if mode == "reject" else GuardrailOutcome.FLAG
        return GuardrailResult(
            outcome=outcome,
            reason=f"PII pattern(s) detected: {', '.join(f['type'] for f in found)}",
            details={"pii_found": found},
        )
    return GuardrailResult(outcome=GuardrailOutcome.PASS)


# ── Error response formatter (validation-error-handling.spec.md shape) ────────

def format_error_response(result: GuardrailResult, request_id: str) -> dict:
    """Convert a GuardrailResult to the contract error shape.
    code is 'guardrail_flag' or 'guardrail_reject' based on outcome."""
    code = "guardrail_flag" if result.outcome == GuardrailOutcome.FLAG else "guardrail_reject"
    return {
        "code": code,
        "details": [{"path": [], "message": result.reason}],
        "request_id": request_id,
    }


# ── Composable runner (route handler inspects list, decides flag/reject) ──────

def run_guardrails(payload: dict) -> list[GuardrailResult]:
    """Run all applicable checks against payload. Returns list[GuardrailResult].
    Never raises — route handler inspects outcomes and enforces REJECT-class checks.

    Expected payload keys (all optional — checks are skipped if key absent):
      output_text, source_text: for check_quantified_claims
      claimed_provenance, actual_provenance: for check_provenance_downgrade
      claim_sources: for check_cross_document_consistency
      external_output (bool): for check_external_output_eligible
      status_claim, status_date, contradicting_doc_date, contradicting_doc_summary: check 5
      pii_content (str): for check_pii; pii_mode (str, default 'flag')
    """
    results: list[GuardrailResult] = []

    if "output_text" in payload and "source_text" in payload:
        results.append(
            check_quantified_claims(payload["output_text"], payload["source_text"])
        )

    if "claimed_provenance" in payload and "actual_provenance" in payload:
        results.append(
            check_provenance_downgrade(payload["claimed_provenance"], payload["actual_provenance"])
        )

    if "claim_sources" in payload:
        results.append(
            check_cross_document_consistency(payload["claim_sources"])
        )

    if payload.get("external_output") and "actual_provenance" in payload:
        results.append(
            check_external_output_eligible(payload["actual_provenance"])
        )

    if "status_claim" in payload and payload["status_claim"] is not None:
        results.append(
            check_status_claim_against_later_evidence(
                status_claim=payload["status_claim"],
                status_date=payload.get("status_date", ""),
                contradicting_doc_date=payload.get("contradicting_doc_date", ""),
                contradicting_doc_summary=payload.get("contradicting_doc_summary", ""),
            )
        )

    pii_content = payload.get("pii_content") or payload.get("output_text")
    if pii_content:
        results.append(
            check_pii(pii_content, mode=payload.get("pii_mode", "flag"))
        )

    return results
