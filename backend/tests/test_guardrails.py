"""
T03 Guardrails unit tests — no live server, pure logic.

Tests 1-10: translated from reference/scaffold/agent-service/tests/test_guardrails.py
(the guardrails portion of the 25-test agent-service suite).
Tests 11-17: spec-added (pii, error shape, composability, AST bypass check).

Run: cd /d/cognitive-os/worktrees/wt-03/backend && uv run pytest tests/test_guardrails.py -v
"""
import ast
import inspect
import re
import pytest


# ── Scaffold-translated tests (1-10) ─────────────────────────────────────────


def test_unsupported_quantified_claim_is_flagged():
    """Scaffold test 1: '70%' in output, not in source → FLAG."""
    from guardrails import GuardrailOutcome, check_quantified_claims
    output = "Reduced screening time by 70% through automation."
    source = "Built a resume screening module for the ATS."
    result = check_quantified_claims(output, source)
    assert result.outcome == GuardrailOutcome.FLAG
    assert "70%" in result.details["unsupported_numbers"]


def test_supported_quantified_claim_passes():
    """Scaffold test 2: '96%' in both output and source → PASS."""
    from guardrails import GuardrailOutcome, check_quantified_claims
    output = "Achieved 96% accuracy on the test set."
    source = "Model evaluation results: 96% accuracy on held-out test set."
    result = check_quantified_claims(output, source)
    assert result.outcome == GuardrailOutcome.PASS


def test_provenance_downgrade_is_rejected():
    """Scaffold test 3: VERIFIED_ARTIFACT claimed, AI_GENERATED_UNVERIFIED actual → REJECT (hard stop)."""
    from guardrails import GuardrailOutcome, Provenance, check_provenance_downgrade
    result = check_provenance_downgrade(
        claimed=Provenance.VERIFIED_ARTIFACT,
        actual=Provenance.AI_GENERATED_UNVERIFIED,
    )
    assert result.outcome == GuardrailOutcome.REJECT


def test_matching_provenance_passes():
    """Scaffold test 4: claimed == actual → PASS."""
    from guardrails import GuardrailOutcome, Provenance, check_provenance_downgrade
    result = check_provenance_downgrade(
        claimed=Provenance.STRUCTURALLY_EVIDENCED,
        actual=Provenance.STRUCTURALLY_EVIDENCED,
    )
    assert result.outcome == GuardrailOutcome.PASS


def test_same_origin_repetition_is_flagged_not_trusted():
    """Scaffold test 5: same session-origin repeated → FLAG (not corroboration).
    Spec trigger: same claim repeated across documents tracing to a SINGLE origin."""
    from guardrails import GuardrailOutcome, check_cross_document_consistency
    result = check_cross_document_consistency(
        claim_sources=["ai_bio_generation_session_2025-10", "ai_bio_generation_session_2025-10"]
    )
    assert result.outcome == GuardrailOutcome.FLAG
    assert result.details["repeat_count"] == 2


def test_independently_sourced_claim_passes():
    """Scaffold test 6: distinct source origins → PASS."""
    from guardrails import GuardrailOutcome, check_cross_document_consistency
    result = check_cross_document_consistency(
        claim_sources=["maaxly_gcp_research_doc", "actual_git_commit_log"]
    )
    assert result.outcome == GuardrailOutcome.PASS


def test_ai_generated_unverified_cannot_reach_external_output():
    """Scaffold test 7: AI_GENERATED_UNVERIFIED + external output → REJECT."""
    from guardrails import GuardrailOutcome, Provenance, check_external_output_eligible
    result = check_external_output_eligible(Provenance.AI_GENERATED_UNVERIFIED)
    assert result.outcome == GuardrailOutcome.REJECT


def test_verified_artifact_can_reach_external_output():
    """Scaffold test 8: VERIFIED_ARTIFACT + external output → PASS."""
    from guardrails import GuardrailOutcome, Provenance, check_external_output_eligible
    result = check_external_output_eligible(Provenance.VERIFIED_ARTIFACT)
    assert result.outcome == GuardrailOutcome.PASS


def test_maaxly_status_claim_regression():
    """Scaffold test 9 (permanent regression per testing.spec.md rule 3):
    Oct AWS resume claims 'MVP Complete' vs Nov GCP doc re-deriving cloud from scratch → FLAG.
    This is the real incident that motivated check 5."""
    from guardrails import GuardrailOutcome, check_status_claim_against_later_evidence
    result = check_status_claim_against_later_evidence(
        status_claim="MVP Complete, Deployment Ready (AWS, $231/month)",
        status_date="2025-10",
        contradicting_doc_date="2025-11",
        contradicting_doc_summary="GCP $300 trial budget research re-deriving cloud choice from zero",
    )
    assert result.outcome == GuardrailOutcome.FLAG
    assert result.details["contradicting_date"] == "2025-11"


def test_status_claim_with_no_later_contradiction_passes():
    """Scaffold test 10: contradicting doc is EARLIER than status claim → PASS."""
    from guardrails import GuardrailOutcome, check_status_claim_against_later_evidence
    result = check_status_claim_against_later_evidence(
        status_claim="Deployed and stable",
        status_date="2025-11",
        contradicting_doc_date="2025-08",
        contradicting_doc_summary="earlier planning doc, superseded",
    )
    assert result.outcome == GuardrailOutcome.PASS


# ── Spec-added tests (11-17) ──────────────────────────────────────────────────


def test_pii_flags_email_address():
    """Spec-added: email address pattern detected → FLAG."""
    from guardrails import GuardrailOutcome, check_pii
    result = check_pii("Contact me at user@example.com for details.", mode="flag")
    assert result.outcome == GuardrailOutcome.FLAG


def test_pii_flags_phone_number():
    """Spec-added: US phone number detected → FLAG."""
    from guardrails import GuardrailOutcome, check_pii
    result = check_pii("Call +1-555-867-5309 to reach me.", mode="flag")
    assert result.outcome == GuardrailOutcome.FLAG


def test_pii_passes_clean_content():
    """Spec-added: no PII patterns → PASS."""
    from guardrails import GuardrailOutcome, check_pii
    result = check_pii("The project uses Python 3.13 and FastAPI.", mode="flag")
    assert result.outcome == GuardrailOutcome.PASS


def test_guardrail_flag_produces_correct_error_shape():
    """FLAG result has code='guardrail_flag', details list, request_id."""
    from guardrails import GuardrailOutcome, GuardrailResult, format_error_response
    result = GuardrailResult(
        outcome=GuardrailOutcome.FLAG,
        reason="unsupported numeric claim",
        details={"unsupported_numbers": ["70%"]},
    )
    error = format_error_response(result, request_id="test-req-001")
    assert error["code"] == "guardrail_flag"
    assert isinstance(error["details"], list)
    assert len(error["details"]) > 0
    assert error["request_id"] == "test-req-001"


def test_guardrail_reject_produces_correct_error_shape():
    """REJECT result has code='guardrail_reject', details list, request_id."""
    from guardrails import GuardrailOutcome, GuardrailResult, format_error_response
    result = GuardrailResult(
        outcome=GuardrailOutcome.REJECT,
        reason="provenance downgrade",
        details={},
    )
    error = format_error_response(result, request_id="test-req-002")
    assert error["code"] == "guardrail_reject"
    assert isinstance(error["details"], list)
    assert error["request_id"] == "test-req-002"


def test_all_checks_composable():
    """run_guardrails(payload) returns list[GuardrailResult] — does NOT raise.
    Route handler inspects and decides to flag-and-proceed or reject."""
    from guardrails import GuardrailOutcome, Provenance, run_guardrails
    payload = {
        "output_text": "Performance improved by 70% overall.",
        "source_text": "Some general improvement was observed.",
        "claimed_provenance": Provenance.AI_GENERATED_UNVERIFIED,
        "actual_provenance": Provenance.AI_GENERATED_UNVERIFIED,
        "claim_sources": ["session_a", "session_a"],
        "external_output": False,
        "status_claim": None,
    }
    results = run_guardrails(payload)
    assert isinstance(results, list)
    assert len(results) > 0
    # Must not raise — returns FLAG/REJECT/PASS outcomes for inspection
    outcomes = {r.outcome for r in results}
    assert GuardrailOutcome.FLAG in outcomes  # '70%' should flag


def test_no_permissive_bypass_flag_exists():
    """
    AST-based enforcement: guardrails.py must contain NO env reads at all
    (no os.environ / os.getenv — guardrails are pure logic, no env config),
    and NO conditional branching on env values inside any check function.

    Why AST, not source-grep: mirrors T02's test 10 design decision.
    Word-grep flags words in docstrings/comments; AST catches real code paths.
    See 02-rbac-port-decisions.md §Decision 8 and 03-guardrails-port-decisions.md.
    """
    import guardrails

    source = inspect.getsource(guardrails)
    tree = ast.parse(source)

    # Check 1: no os.environ / os.getenv anywhere in guardrails.py
    # (guardrails are pure logic; they have no configuration path at all)
    class EnvReadVisitor(ast.NodeVisitor):
        def __init__(self):
            self.violations: list[str] = []

        def visit_Attribute(self, node: ast.Attribute):
            if node.attr in {"environ", "getenv"}:
                self.violations.append(f"env read '{node.attr}' found in guardrails.py")
            self.generic_visit(node)

    env_visitor = EnvReadVisitor()
    env_visitor.visit(tree)
    assert env_visitor.violations == [], (
        "guardrails.py reads env vars (should be pure logic):\n"
        + "\n".join(env_visitor.violations)
    )

    # Check 2: no If-on-env in any function
    class EnvBranchVisitor(ast.NodeVisitor):
        def __init__(self):
            self.violations: list[str] = []
            self._current_func: str | None = None

        def visit_FunctionDef(self, node: ast.FunctionDef):
            outer = self._current_func
            self._current_func = node.name
            self.generic_visit(node)
            self._current_func = outer

        visit_AsyncFunctionDef = visit_FunctionDef

        def visit_If(self, node: ast.If):
            cond_src = ast.unparse(node.test)
            if "environ" in cond_src or "getenv" in cond_src:
                self.violations.append(
                    f"If-on-env in {self._current_func!r}: {cond_src!r}"
                )
            self.generic_visit(node)

    branch_visitor = EnvBranchVisitor()
    branch_visitor.visit(tree)
    assert branch_visitor.violations == [], (
        "guardrails.py branches on env value:\n"
        + "\n".join(branch_visitor.violations)
    )
