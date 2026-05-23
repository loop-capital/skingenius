---
name: Code Review
description: Comprehensive code review with security, performance, and best practices focus
triggers:
  - review
  - audit
  - check code
  - security review
---

# Code Review Skill — SKINgenius

When reviewing code, follow this systematic approach adapted for SKINgenius:

## 1. Security (FIRST — always check)

- [ ] No hardcoded secrets, API keys, or passwords
- [ ] Input validation on all user-provided data
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitized output)
- [ ] Authentication/authorization on protected routes
- [ ] CORS properly configured
- [ ] Rate limiting on public endpoints
- [ ] Supabase service role key NEVER in client code
- [ ] RLS enabled on all tables
- [ ] Skin photos encrypted at rest and in transit

## 2. TypeScript Quality

- [ ] No `any` types (unless documented why)
- [ ] Explicit return types on public functions
- [ ] Null/undefined properly handled (`User | null`)
- [ ] Strict mode enabled
- [ ] Enums or union types instead of magic strings

## 3. Error Handling

- [ ] Try/catch around async operations
- [ ] Errors logged with context (not swallowed)
- [ ] User-facing errors are helpful (not stack traces)
- [ ] Unhandled promise rejections caught
- [ ] Graceful degradation for AI model failures

## 4. Performance

- [ ] No N+1 database queries
- [ ] Proper pagination on list endpoints
- [ ] No memory leaks (event listeners cleaned up)
- [ ] Database indexes for common queries
- [ ] No unnecessary re-renders (React)
- [ ] Image compression for skin photos

## 5. Testing

- [ ] New code has corresponding tests
- [ ] Tests have explicit assertions (not just "page loads")
- [ ] Edge cases covered (empty, null, max values)
- [ ] Mocks are realistic
- [ ] Error states tested

## 6. Architecture

- [ ] API versioning (`/api/v1/`) followed
- [ ] Service separation respected
- [ ] No business logic in route handlers
- [ ] Types defined in `src/types/`
- [ ] Handlers in `src/lib/` or `src/app/api/`
- [ ] No file exceeds 300 lines
- [ ] No function exceeds 50 lines

## 7. SKINgenius-Specific

- [ ] Never diagnose definitively — always recommend dermatologist
- [ ] Never fabricate clinical evidence — cite PubMed
- [ ] urgentFlag: true → suppress product recs, show dermatologist CTA
- [ ] Skin data treated as health data (encrypted, access-controlled)
- [ ] Product recommendations evidence-based, not marketing-driven

## Output Format

For each issue:
- **Severity**: 🔴 Critical | 🟡 Warning | 🔵 Suggestion
- **Location**: file:line
- **Issue**: What's wrong
- **Fix**: How to fix it
- **Why**: Why this matters

## Severity Definitions

- **🔴 CRITICAL**: Security vulnerability, data loss risk, or medical misinformation. Must fix before merge.
- **🟡 WARNING**: Code smell, potential bug, or maintainability issue. Fix before merge if possible.
- **🔵 SUGGESTION**: Style preference, minor optimization, or documentation gap. Fix at discretion.
