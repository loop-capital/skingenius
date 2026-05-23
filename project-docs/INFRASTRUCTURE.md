# Infrastructure — SKINgenius

> Deployment, environment, and operational details.

---

## Production

| Item | Value |
|------|-------|
| URL | https://skingenius-sigma.vercel.app |
| Hosting | Vercel |
| Database | Supabase (cnzoilxsttoqtvwotexd.supabase.co) |
| Storage | Cloudflare R2 |
| Auth | NextAuth + Supabase Auth |
| CI/CD | Vercel auto-deploy from git |

## Environment Variables

Required in `.env.local` (NEVER commit this file):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://cnzoilxsttoqtvwotexd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<secret>
GOOGLE_CLIENT_ID=<google-client>
GOOGLE_CLIENT_SECRET=<google-secret>
APPLE_CLIENT_ID=<apple-client>
APPLE_CLIENT_SECRET=<apple-secret>

# R2 Storage
R2_ACCOUNT_ID=<account-id>
R2_ACCESS_KEY_ID=<access-key>
R2_SECRET_ACCESS_KEY=<secret-key>
R2_BUCKET_NAME=skingenius-photos
```

## Build Commands

```bash
npm run dev          # Local dev server
npm run build        # Production build (typecheck + compile)
npm run start        # Run production build locally
npm run lint         # ESLint
```

## Database Migrations

- Schema file: `supabase/complete-setup.sql` (744 lines)
- Apply via Supabase Dashboard → SQL Editor
- Row Level Security (RLS) enabled on all user tables

## Vercel Project Settings

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |
| Node Version | 18.x |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-23 | Created INFRASTRUCTURE.md |
| 2026-05-22 | Deployed to Vercel (skingenius-sigma.vercel.app) |
