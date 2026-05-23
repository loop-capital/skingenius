# Architectural Decisions — SKINgenius

> Record WHY you chose X over Y. Future-you (and future-Claude) will thank you.

---

## Decision Template

When adding a new decision, copy this template:

```markdown
## ADR-XXX: [Title]

**Date:** YYYY-MM-DD
**Status:** Accepted | Superseded by ADR-XXX | Deprecated

### Context
What is the issue or situation that motivated this decision?

### Decision
What is the change we're making?

### Alternatives Considered
| Option | Pros | Cons |
|--------|------|------|
| Option A | ... | ... |
| Option B | ... | ... |

### Consequences
What are the positive and negative results of this decision?
```

---

## ADR-001: On-Device AI (Gemma 4B) Over Server-Side Vision

**Date:** 2026-05-21
**Status:** Accepted

### Context
Skin analysis requires processing personal photos. Sending photos to a server creates privacy concerns and API costs. We need accurate analysis without compromising user trust.

### Decision
Use Google's Gemma 4B model via LiteRT-LM for on-device inference. Photos NEVER leave the phone. Only analysis JSON results are sent to the server.

### Alternatives Considered
| Option | Pros | Cons |
|--------|------|------|
| Server-side vision (OpenAI, Gemini API) | Higher accuracy, easier to update | Privacy risk, $0.01-0.05/scan, latency |
| On-device (Gemma 4B LiteRT) | Zero cost, private, works offline | Slightly lower accuracy, model updates harder |
| Hybrid (device first, server fallback) | Best of both | Complexity, partial privacy |

### Consequences
- Zero AI inference costs (funded by affiliate links)
- Privacy-first positioning (marketing advantage)
- Works offline
- Model updates require app store release

---

## ADR-002: Supabase Over Custom Backend

**Date:** 2026-05-21
**Status:** Accepted

### Context
Need auth, database, real-time, and row-level security. Building custom would take weeks.

### Decision
Use Supabase for all backend services. Next.js API routes handle business logic.

### Consequences
- Auth + DB + RLS in one service
- Faster development (days not weeks)
- Vendor lock-in risk (mitigated by Postgres portability)

---

## ADR-003: Square Over Stripe for Payments

**Date:** 2026-05-18
**Status:** Accepted

### Context
Salon industry standard. Square has POS integrations we need for inventory tracking.

### Decision
Square only. No Stripe.

### Consequences
- Better salon integration (Square POS)
- Simpler payment stack (one provider)
- Less ecosystem compared to Stripe

---

## ADR-004: Vercel Over Self-Hosted

**Date:** 2026-05-21
**Status:** Accepted

### Context
Need fast deploys, edge functions, CDN. Don't want to manage servers.

### Decision
Deploy to Vercel. Auto-deploy from git.

### Consequences
- Zero DevOps overhead
- Edge functions for auth middleware
- Vendor lock-in (Next.js is Vercel-native)
- Cost scales with usage (acceptable for MVP)

---

## ADR-005: Tailwind CSS Over Custom Styles

**Date:** 2026-05-21
**Status:** Accepted

### Context
Need rapid UI development for MVP. Custom CSS is slow to iterate.

### Decision
Tailwind CSS for all styling.

### Consequences
- Fast iteration
- Consistent design system
- Smaller bundle (purge unused)
- Learning curve for new developers

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-23 | Created DECISIONS.md with 5 ADRs |
