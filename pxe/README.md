# PXE — Knowledge marketplace for The Gambia & Senegal

**Turn what you know into income.** Creators publish courses, sell them in GMD,
XOF, or EUR through local payment methods, and share their storefront at
`/creator/[username]`. Students pay, learn on their phones, and pick up where
they left off.

## Status

**Stage 0: architecture and draft schema.** Nothing runs yet.

| Path | Contents |
|---|---|
| `docs/ARCHITECTURE.md` | Repo inspection, stack, MVP scope, payment & video research, unknowns, build stages |
| `supabase/migrations/0001_core_schema.sql` | Draft relational schema (money in minor units, append-only ledger, idempotent payment events) |
| `supabase/migrations/0002_rls.sql` | Draft row-level security |

The migrations have **not** been applied to any database. No payment or video
provider is integrated, and nothing here should be read as a claim that one is
available.

## Next stage

Stage 1 is the Next.js + Tailwind scaffold: design tokens, EN/FR i18n, and the
public pages (homepage, marketplace, course detail, creator storefront) using
clearly labeled demo data. See `docs/ARCHITECTURE.md` §9.
