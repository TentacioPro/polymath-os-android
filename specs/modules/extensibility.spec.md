# Spec: Usability, Adaptability & Extensibility (aspect 10)

The JARVIS requirement, made mechanical: the system grows by REGISTRATION, not modification.

## Extension points (each is add-a-file + register, never edit-the-core)
| To add… | You write | You register in | Core files touched |
|---|---|---|---|
| a sub-agent | agent module + spec + tests | SUB_AGENT_REGISTRY | 0 (hooks auto-apply via run_agent_step) |
| a node type | schema + migration + tests | schemas.spec.md registry | 0 |
| a screen | screen on M3 skeleton + tests | route table / nav | 0 |
| a guardrail check | check fn + tests | guardrail chain list | 0 |
| an importer/source | staged_write agent (see sub-agent) | registry | 0 |
| an interface (voice, CLI) | thin client of api.spec.md | — | 0 (contract already client-agnostic) |

## Hard rules
1. "Zero core files touched" is testable and tested: adding the reference example (a trivial
   `echo` sub-agent kept in-tree) is a CI job proving the registry path stays open.
2. Voice (the JARVIS chat UI, self-log §2) is explicitly interface #3 of the same API contract —
   designed-for now, built later. Nothing may assume "the client is a screen".
3. Usability over the journey: the system must be useful at every ledger stage — after Task 08
   you journal with staging; after 09 on both clients; after 10 durably. No big-bang cutover.
4. Adaptability of the person, not just the code: metacognitive/ikigai agents read the same
   graph, so life changes (new habit, new goal, dropped skill) are data updates, not features.
