---
name: erd-generator
description: Design or revise a Mermaid entity-relationship diagram from domain requirements, data-model requests, or architecture-diagram requests, then validate and render it as an SVG.
---

# ERD Generator

Convert the user's domain requirements into a Mermaid `erDiagram` and a validated SVG artifact.

## Workflow

1. Extract entities, attributes, primary keys (`PK`), foreign keys (`FK`), and relationship cardinalities. Resolve ambiguity conservatively and state material assumptions in the final response.
2. Write the complete Mermaid source directly to `docs/architecture/schema.mmd`. Include entity attributes with their types and key annotations, and express each relationship with Mermaid ER cardinality markers.
3. From the repository root, run `node .agent/skills/erd-generator/scripts/render_erd.js docs/architecture/schema.mmd`.
4. If the command fails with `SYNTAX_ERROR`, inspect the trace, correct `docs/architecture/schema.mmd`, and rerun. Make no more than three correction retries after the initial attempt. If validation still fails, report the trace and do not claim that rendering succeeded.
5. On success, include the raw Mermaid source in the response and reference the generated asset at `docs/architecture/erd.svg`.

Do not report success until the renderer exits with code 0 and prints `SUCCESS`.