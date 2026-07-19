# Spec: Interoperability — OKF, MCP, Skills (answers "can outside tools interact with my data?")

## OKF (Google Open Knowledge Format, v0.1, published 2026-06-12)
Markdown files + YAML frontmatter in a directory; path = identity; typed concepts linked by
markdown links → a portable knowledge graph any agent can read. Verified real; v0.1 is minimal.
**Adoption: YES, as an EXPORT/interchange format** (not internal storage — Kùzu/LanceDB stand):
1. `export --okf` renders graph slices as OKF bundles (one file per node, provenance + type in
   frontmatter, edges as links). This upgrades privacy-spec's export rule from "open formats"
   to "a standard agents already read".
2. The core-memory bundle (memory.spec.md tier 1) is authored AS OKF from day one.
3. Provenance travels in frontmatter: any consumer sees `provenance: ai_generated_unverified`
   on such nodes. Export refuses to strip it.
4. Watch item: OKF is v0.1 (structural, not yet semantic interop). Pin exporter to spec version.

## MCP — two directions
1. **Expose (the big one): `polymath-mcp` server** — YOUR data as tools for Claude Code /
   Desktop / any MCP client: `search_graph`, `get_node`, `journal_stage`, `list_staged`,
   `confirm_staged`. Every tool call passes the SAME chain (RBAC role `agent:mcp_client` scoped
   read + staged-write only → guardrails → audit). No MCP tool can commit, delete, or read
   crypto-protected fields. This makes the system a first-class citizen of your agent ecosystem
   instead of an island. Ledger: Task 19.
2. **Consume**: sub-agents use external MCP servers (n8n-mcp fork, ElevenLabs MCP already in
   your stack) through the orchestrator, traced like any tool call.

## Skills
Sub-agent capabilities double as portable skill definitions (SKILL.md convention — you already
write these: polymath-os SKILL_*.md, the SKILLS repo). Each sub-agent task spec emits a
SKILL.md so any harness (Claude Code, Hermes, PI) can invoke the capability description even
outside our runtime.

## Hard rule
Interop NEVER bypasses trust: OKF export carries provenance; MCP tools sit behind the full
chain; a skill file describes, it does not grant. "Interactable" ≠ "unprotected".
