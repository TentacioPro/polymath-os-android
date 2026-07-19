# Spec: Privacy & Data Ownership (aspect 9b — named gap)

This system holds health treatments, a breakup, smoking history, finances. Rules match stakes.

1. **Everything exportable, always**: one command dumps the full graph + vectors + audit log to
   open formats (JSONL + parquet + markdown). No lock-in to this system's own storage. Export is
   tested like backup: restore-drill into a fresh instance.
2. **Right to delete is real**: hard-delete purges a node's content across graph, vectors,
   staging, and derived inferences (`derived_from` pointers make cascade findable). The audit
   log records THAT a deletion happened (actor/time/type), never the deleted content.
3. Third-party boundaries: no personal-graph content leaves the machine except (a) LLM API calls
   — minimized, and never for `HealthTreatment`/`LifeChapter` bodies unless a local model is the
   executor or you explicitly confirm per-call; (b) resume/cover-letter outputs — already
   provenance-gated to user_attested + verified_artifact.
4. Imported social data (future CUA importer) lands in staging with source labels; nothing about
   other people (chat counterparts, authors) becomes a graph node without explicit confirmation.
5. Local model preference for sensitive inference: metacognitive/journal analysis prefers the
   Ollama-hosted model when quality permits; the orchestrator records which model saw what.
