# PXE — Knowledge marketplace for The Gambia & Senegal

**Turn what you know into income.** Creators publish courses, sell them in GMD,
XOF, or EUR through local payment methods, and share their storefront at
`/creator/[username]`. Students pay, learn on their phones, and pick up where
they left off.

## Status

**Stage 1 of 6.** The public website works in English and French using
**fictional demo data, labeled "Demo" everywhere it appears**.

Not built yet:
- accounts and login
- course creation
- video
- payments

Enrollment buttons stay disabled and say so. See `docs/ARCHITECTURE.md` §9 for
the stage plan.

| Route | Page |
|---|---|
| `/en`, `/fr` | Homepage (`/` redirects using the browser's language) |
| `/[lang]/courses` | Marketplace: search plus category, language, level, price, and currency filters (works without JavaScript) |
| `/[lang]/courses/[slug]` | Course detail: curriculum, preview lessons, prices per currency, access & refund policy, related courses |
| `/[lang]/creator/[username]` | Creator storefront with a shareable link |
| `/[lang]/pricing`, `/[lang]/teach` | Creator plans (prices still to be announced), teaching info |
| `/[lang]/legal/{terms,privacy,refunds}` | **Draft** policies, marked as pending legal review |

## Run locally

Requires Node 22+.

```bash
cd pxe
npm install
cp .env.example .env.local   # optional
npm run dev                  # http://localhost:3000 (demo mode is on in dev)
```

| Command | What it does |
|---|---|
| `npm test` | Unit tests: money math, filters, demo-data integrity, payment gating |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run build` | Production build (demo off by default; set `PXE_DEMO_MODE=true` for a demo preview) |

## Environment variables

See `.env.example`.

| Variable | Purpose |
|---|---|
| `PXE_DEMO_MODE` | `true` or `false`. Defaults to on in development and off in production. Read at build time. |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Contact address shown on the site. Hidden when unset. |

Supabase and payment-provider variables are listed in `.env.example` but are
not used yet.

## Deploy (Vercel)

1. Import the repository into Vercel.
2. Set **Root Directory** to `pxe`. The framework preset is detected as
   Next.js.
3. For a public demo preview, set `PXE_DEMO_MODE=true`. Leave it unset for
   production: without a database, the marketplace then shows an honest
   "courses are on their way" empty state.

## Layout

```
src/app/[lang]/          pages (root layout lives here; global-not-found.tsx handles unknown URLs)
src/components/          site chrome, course UI, language switcher, copy-link
src/i18n/                locales + typed dictionaries (en, fr; wo planned)
src/lib/money.ts         minor-unit money formatting/parsing/fees (no floats, no FX)
src/lib/catalog/         types, demo data, filters, repository interface (swap for Supabase in stage 2)
src/lib/payments/        PaymentProvider interface + candidate list (no adapters yet)
supabase/migrations/     draft schema + RLS (not applied)
docs/ARCHITECTURE.md     architecture, research, risks, roadmap
```

> **Next.js 16 note:** this project uses Cache Components. Read `AGENTS.md`
> and the docs in `node_modules/next/dist/docs/` before changing routing or
> data fetching.
