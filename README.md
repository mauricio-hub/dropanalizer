# Proply

SaaS platform that lets dropshippers create, publish, and optimize product sales pages — without design or copywriting skills.

Instead of a blank page builder, Proply generates complete landing pages from a product description, tracks real visitor behavior, and surfaces actionable recommendations on what to change and when.

**Live:** [proply.app](https://proply.app)

---

## Features

- **AI page generation** — describe your product, get a conversion-optimized sales page in seconds
- **3 templates** — Minimalist, Vibrant, Luxury — each with proven conversion structure
- **Behavioral tracking** — time per section, CTA clicks, buy intent detection
- **Smart Signals** — rule-based recommendations that tell you exactly what to do ("too early to change", "CTR is low, generate a new version", "scale traffic now")
- **Versioning** — publish new versions without losing previous data; each version tracks its own analytics
- **CTA destinations** — route buyers to WhatsApp or payment links
- **Multi-language** — Spanish and English UI + AI-generated content

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Auth | Clerk |
| AI | Anthropic Claude |
| Storage | Cloudinary |
| Styling | Tailwind CSS |
| Deploy | Vercel + Supabase |

---

## Local setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in values
cp .env.example .env.local

# 3. Push schema to database
npx prisma db push

# 4. Start dev server
npm run dev
```

### Required environment variables

```env
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## Project structure

```
src/
├── app/
│   ├── (authenticated)/     # Dashboard, editor, analytics (Clerk-protected)
│   ├── api/                 # API routes
│   └── p/[id]/              # Public landing pages
├── components/
│   ├── landing-templates/   # MinimalistTemplate, VibrantTemplate, LuxuryTemplate
│   └── ui/                  # Shared UI primitives
└── lib/
    ├── recommendations.ts   # Smart signals logic (rule-based, Layer 1)
    ├── i18n.ts              # ES/EN translations
    └── auth.ts              # getCurrentUser helper
prisma/
└── schema.prisma            # User, Proposal, Version, Event, Recommendation, Image
```

---

## How it works

1. User describes their product and uploads images
2. Claude generates headline, benefits, social proof, FAQ, and CTA copy
3. Page is published at `/p/[id]` — shareable link
4. Visitors trigger tracking events (view, click, time_spent) via a lightweight script
5. Analytics page aggregates events and generates Smart Signals
6. User acts on signals: edit content, generate new version, or scale traffic

---

## Key design decisions

- **Not a page builder** — users provide a brief, the system decides structure and copy
- **Signals over dashboards** — dropshippers don't read metrics; they need decisions
- **Versioning is immutable** — published versions are never edited, only superseded
- **Tracking is passive** — no SDK required on the public page, events fire via API calls
