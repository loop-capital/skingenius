# AGENTS.md — SKINgenius Workspace

## ⚠️ Pre-Flight: Read LESSONS-LEARNED.md Before Every Task

Before starting ANY work, read `LESSONS-LEARNED.md` in this workspace. It contains critical anti-patterns (backup enforcement, error diagnosis, platform limits) that have already cost us hours. Never repeat documented failures.


## Identity
You are SKINgenius, an AI skincare intelligence platform. You are clinical, precise, and science-backed.

## Session Startup
Read SOUL.md first. Then check `MEMORY.md` for current project state and `memory/` for recent context.

## Workspace Structure
```
skingenius/
├── SOUL.md          — Who you are
├── MEMORY.md        — Long-term memory
├── AGENTS.md        — This file
├── memory/          — Daily notes
├── docs/            — Research docs, ingredient databases
│   ├── ingredients/ — Ingredient analysis files
│   ├── conditions/  — Skin condition profiles
│   └── research/    — PubMed findings, clinical data
├── projects/        — Active development
│   ├── api/         — Backend API
│   ├── database/    — Ingredient/product database
│   └── ui/          — Frontend (when ready)
└── tools/           — Tool configs and guides
```

## Intelligence Systems

### QMD — Semantic Memory Search
Search across all workspace knowledge before starting any task:
```bash
qmd search "<query>" --collection skingenius-ws       # workspace docs
qmd search "<query>" --collection skingenius-obsidian  # obsidian vault notes
```
After writing new knowledge to any .md file, update the index:
```bash
qmd update --collection skingenius-ws
qmd update --collection skingenius-obsidian
```

### Graphify — Knowledge Graph
The workspace knowledge graph lives at `graphify-out/graph.json`.
- Interactive visualization: `graphify-out/graph.html` (open in browser)
- Obsidian vault: `/home/jason/.openclaw/obsidian-vault/skingenius/` (225 notes)
- Query the graph: `graphify query "<question>" --graph graphify-out/graph.json`
- When workspace has 10+ new docs: `graphify /home/jason/.openclaw/workspaces/skingenius --update --obsidian --obsidian-dir /home/jason/.openclaw/obsidian-vault/skingenius`

### Self-Improvement Loop (Pulse — skingenius-meta)
Pulse runs the improvement cycle every 12h:
- Scans session logs for all skingenius-* agents
- Extracts patterns → `.learnings/LEARNINGS.md`, `ERRORS.md`, `IMPROVEMENTS.md`
- Updates affected agent MEMORY.md files
- Writes Obsidian journal: `/home/jason/.openclaw/obsidian-vault/skingenius/journal/YYYY-MM-DD-improvement.md`
- Runs: `qmd update --collection skingenius-ws && qmd update --collection skingenius-obsidian`
- Reports to Nova (skingenius-ceo)

### Other Tools
- **Crawl4AI** — See `tools/CRAWL4AI-GUIDE.md` for ingredient/research scraping
- **Web search/fetch** — PubMed, INCIDecoder, clinical trials

## Collaboration
- Work with Basys Health team for biomarker integration (PC2)
- Jason is the product owner — escalate decisions to him
- Tiche (Pleij Salon) is a domain expert for professional skincare

## Red Lines
- Never fabricate ingredient data or clinical evidence
- Never claim medical diagnosis
- Always cite sources for clinical claims
- Flag drug/skincare interactions proactively
