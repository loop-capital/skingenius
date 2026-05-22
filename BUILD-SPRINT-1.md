# SKINgenius — Build Sprint 1

> **Started:** 2026-05-21 23:20 EDT
> **Orchestrator:** Che 🧬

---

## Phase 0: Foundation (Jason)
| Task | Status | Owner |
|------|--------|-------|
| Apply Supabase schema (supabase/complete-setup.sql) | ⏳ PENDING | Jason |
| Send Fitzpatrick 17k letter to Matt Groh | ⏳ PENDING | Jason |
| (Northwestern email: matthew.groh@northwestern.edu) | 📝 NOTED | — |

## Phase 1: Backend Core ✅ COMPLETE
| Task | Status | Agent |
|------|--------|-------|
| Build POST /api/v1/scan endpoint | ✅ DONE | skingenius-dev |
| Seed Supabase schema + seed data | ✅ DONE | skingenius-devops |
| Build Fit Score recommendation engine | ✅ DONE | skingenius-data |

## Phase 2: Frontend (IN PROGRESS — spawning now)
| Task | Status | Agent |
|------|--------|-------|
| Scan flow UI (camera → upload → results) | 🔄 SPAWNING | skingenius-dev |
| Results dashboard (conditions, root causes, products) | 🔄 SPAWNING | skingenius-design |
| Product cards + routine builder | 🔄 SPAWNING | skingenius-dev |

## Phase 3: Integration + Deploy
| Task | Status | Agent |
|------|--------|-------|
| Auth + user profiles (Supabase Auth) | ⏳ QUEUED | skingenius-dev |
| Deploy to Vercel + CI/CD | ⏳ QUEUED | skingenius-devops |
| Pro tier API endpoints | ⏳ QUEUED | skingenius-data |

## Phase 4: Testing + Launch
| Task | Status | Agent |
|------|--------|-------|
| Code review + security audit | ⏳ QUEUED | skingenius-syntax |
| Vision pipeline testing (20 sample photos) | ⏳ QUEUED | skingenius-ai |
| Bug fixes + polish | ⏳ QUEUED | All |

---

## Cron Jobs
- **Every 2 hours (8 AM - 10 PM):** Che checks Phase status, spawns next agents if prior phase complete
- **Daily 9 AM:** Daily standup report
- **Daily 6 PM:** Evening status compilation

## Notes
- If agents need research → spawn skingenius-research (Kimi)
- If stuck on architecture → escalate to Claude Code
- Fitzpatrick letter: Matt Groh, Northwestern Kellogg — matthew.groh@northwestern.edu
