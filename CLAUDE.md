# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev          # Start dev server (Next.js)
npm run build        # Production build
npm run lint         # ESLint

npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:push      # Sync prisma/schema.prisma to the database (no migration files)
npm run db:studio    # Open Prisma Studio GUI at localhost:5555
```

No test runner is configured in this project.

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk frontend key
- `CLERK_SECRET_KEY` — Clerk backend key
- `ANTHROPIC_API_KEY` — Claude API key
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` — Cloudinary cloud name
- `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — Image uploads

`DATABASE_URL` is in `.env` (Supabase PostgreSQL).

## Architecture Overview

**Stack:** Next.js 14 App Router · TypeScript · Prisma + PostgreSQL (Supabase) · Clerk auth · Anthropic Claude SDK · Tailwind CSS (dark theme)

### Route Layout

```
src/app/
  (authenticated)/       # All routes requiring login
    proposals/[id]/      # Proposal edit/detail pages
    settings/            # User settings
  api/                   # API routes (Next.js route handlers)
  p/[id]/                # Public landing page (no auth)
  sign-in / sign-up/     # Clerk auth pages
```

### Key Directories

- **`src/lib/`** — Server-side singletons and utilities
  - `auth.ts` — `getCurrentUser()`: resolves Clerk session → upserts DB user → returns full user object. Call this at the top of every authenticated API route.
  - `prisma.ts` — Prisma client singleton (import from here, not directly from `@prisma/client`)
  - `openai.ts` — Anthropic SDK client (named `openai` for historical reasons; uses `claude-sonnet-4-5` model)
  - `permissions.ts` — `FREE_PLAN_PROPOSAL_LIMIT = 3`; plan-checking helpers; `ADMIN_EMAILS` list
  - `recommendations.ts` — Computes analytics signals and generates `Recommendation` records
  - `tracking.ts` — Client-side event fire-and-forget to `/api/track`

- **`src/components/landing-templates/`** — Landing page templates rendered at `/p/[id]`
  - `MinimalistTemplate.tsx`, `VibrantTemplate.tsx`
  - `landingText.ts` — Static copy / i18n strings for templates

- **`src/types/index.ts`** — All shared TypeScript domain types (`Proposal`, `Version`, `Event`, `Recommendation`, `CtaDestination`, etc.)

### Data Model (core relationships)

```
User → Proposal → Version → Event (tracking)
                → Recommendation (AI insights)
              → Image (Cloudinary)
              → CtaDestination (WhatsApp/link CTA)
```

- Proposals have `type: service | product` and `status: draft | published`.
- Versions are append-only; each has a `publicUrl` generated on publish.
- Events (`view`, `click`, `time_spent`) are tied to a `Version`, not a `Proposal`.

### Authentication Pattern

Every authenticated API route must call `getCurrentUser()` first:

```ts
const user = await getCurrentUser();
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```

Multi-tenancy is enforced by always filtering Prisma queries with `userId: user.id`.

### AI Integration

`src/lib/openai.ts` exports an Anthropic SDK client. Landing page copy and proposal content are generated via `claude-sonnet-4-5`. Calls are made server-side only (API routes), never from client components.

### Tailwind Theme

Dark theme only. Key custom tokens from `tailwind.config.js`:
- Background: `#0B0F14`, Surface: `#111827`
- Accent green: `#22C55E` (`green-500`)
- Hero gradient: `hero-gradient` utility class

## Product Context

Full product spec is in `.claude/CLAUDE.md`. Key constraints for coding decisions:
- **Not a page builder** — AI generates pages; users provide input, system executes
- **MVP scope only** — No A/B testing, no catalog-driven proposals, no advanced analytics UI
- **Free plan limit** — Max 3 proposals per free user (enforced in `lib/permissions.ts`)
- **Spec-driven workflow** — For non-trivial tasks, write a spec first and wait for user confirmation before coding (see `.claude/CLAUDE.md` §Development Workflow)
