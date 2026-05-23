# SKINgenius API

> Free, on-device AI skin analysis. No per-scan costs. Privacy-first.  Scan images are analyzed on the user's device (MediaPipe + Gemma 4). Only results are sent to this API for persistence and recommendations.

**Source spec:** [openapi.yaml](/home/jason/.openclaw/workspaces/skingenius/openapi.yaml)

## Start Here

Start with this file to understand the generated artifact set before opening operation or model pages.

If a page includes **Source** or **Source spec** links, use those for exact provenance and final verification.

## Quick Start

**Base URL:** `https://skingenius-sigma.vercel.app`

2 operations · 9 schemas

## Artifact Map

- [AGENTS.md](AGENTS.md) - Start-here guide for agents: artifact map and recommended workflow
- [llms.txt](llms.txt) - Compact discovery index for tags, operations, and model groups
- [llms-full.txt](llms-full.txt) - Complete API documentation in one file
- [llms-operations.txt](llms-operations.txt) - All operations only
- [llms-models.txt](llms-models.txt) - All models/components only
- [llms-operations-0001.txt](llms-operations-0001.txt) - Operation shard 1
- [llms-models-0001.txt](llms-models-0001.txt) - Model shard 1

- `operations/*.md` - One Markdown page per operation or webhook with parameters, security, request/response details, and related links.
- `operations/*.json` - One machine-readable JSON artifact per operation or webhook for structured traversal and code generation.
- `models/<type>/*.md` - One Markdown page per model or component with schema summaries and cross-links.
- `models/<type>/*.json` - One machine-readable JSON artifact per model or component.
- `bundle.json`, `index.json`, `nav.json`, `manifest.json` - Top-level machine-readable artifacts for structured traversal of the rendered docs set.
- `index.html`, `operations/*.html`, `models/**/*.html` - Optional human-oriented browsing surfaces; use them last for LLM work.

## Recommended Workflow

1. Read [llms.txt](llms.txt) to find the most relevant tag, operation, or model family.
2. Open the matching `operations/<slug>.md` page for concrete endpoint details and usage guidance.
3. Follow links into `models/<type>/<slug>.md` for request and response shapes.
4. Use [llms-full.txt](llms-full.txt) only when you need broad one-file retrieval or cross-cutting summaries.
5. Fall back to source links or optional JSON artifacts when you need exact provenance or structured traversal.

## Notes

- [llms.txt](llms.txt) is an index, not the full documentation corpus.
- Operation and model Markdown files are the preferred detailed reading surface for agents.
- HTML is useful for human browsing, but it carries more layout noise than Markdown or JSON.
