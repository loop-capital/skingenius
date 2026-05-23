---
description: Generate architecture diagrams from actual SKINgenius code
scope: project
argument-hint: [architecture|api|database|all]
---

# Diagram

Generate architecture diagrams from the actual codebase.

## Usage
- `/diagram architecture` — System overview diagram
- `/diagram api` — API endpoint map
- `/diagram database` — Database schema diagram
- `/diagram all` — Generate all diagrams

## Instructions

1. **architecture** — Map the system:
   - Scan all API routes in `app/api/v1/`
   - Map data flows (scan → analysis → recommendations)
   - Show external services (Supabase, R2, LiteRT)
   - Output as Mermaid diagram in `docs/diagrams/architecture.md`

2. **api** — Map all endpoints:
   - List every route in `app/api/v1/`
   - Show method, path, auth required, request/response schema
   - Output as table in `docs/diagrams/api-map.md`

3. **database** — Map the schema:
   - Read `supabase/complete-setup.sql` or schema file
   - Show tables, relationships, RLS policies
   - Output as Mermaid ER diagram in `docs/diagrams/database.md`

4. **all** — Generate all three diagrams

## Output
All diagrams saved to `docs/diagrams/` directory.
Use Mermaid syntax for diagrams (renders in GitHub).
