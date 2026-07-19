# Spec: Memory Manager (Letta-pattern, provenance-gated) — answers "is Letta-like memory done?"

## Honest status: NOT BUILT. The substrate exists; the manager does not.
What exists: the graph (durable semantic memory), journal nodes (episodic), LanceDB (archival
retrieval), staging + provenance + audit (the trust layer Letta lacks). What's missing: the
Letta/MemGPT behaviors — tiered context, self-editing memory, consolidation. This spec defines
them ON TOP of our trust layer, not beside it. Ledger: Task 18.

## Memory tiers → our implementation
| Letta concept | Ours |
|---|---|
| Core memory (always in context) | a small OKF-style bundle (persona + key user facts), ALL `user_attested`, loaded by the orchestrator into every sub-agent call |
| Conversation/working | session state in orchestrator, discarded or distilled at session end |
| Episodic | journal + interaction nodes, timestamped, provenance-tagged |
| Semantic/archival | the graph + LanceDB — already specced (data-layer, schemas) |

## Hard rules
1. **Self-editing is staged.** An agent proposing a core-memory edit ("user now smokes ~20/wk")
   writes to staging like any other write. Narrow auto-commit rules (owner-defined, e.g.
   "habit-count updates from CiggTrack-source data auto-commit as `verified_artifact`") are the
   only bypass, and each auto-commit rule is itself audit-logged when created and when fired.
2. **Consolidation is an agent, not magic**: a scheduled `memory-consolidation` sub-agent
   (agent:read_only + staged_write) distills episodic → semantic candidates with `inference`
   provenance and `derived_from` pointers. It never deletes source episodes.
3. Core memory has a token budget (target ≤1.5k) and an eviction rule: least-recently-relevant
   facts demote to the graph, never vanish.
4. "Understand my past the way I felt it" (the core requirement): retrieval for personal-history
   questions ALWAYS surfaces the user's own words (user_attested episodic nodes) above any
   inference node, and inferences render with their derived_from trail.
5. References: agents-from-scratch fork (LangGraph memory + HITL patterns), hermes-agent
   ("grows with you") — patterns only; Letta itself not imported (its memory has no provenance).
