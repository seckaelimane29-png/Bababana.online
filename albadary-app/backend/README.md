# Albadary backend

The backend is a Supabase project (`albadary`, project ref `tiwetfxfubjdrgtbwimm`,
region `eu-west-3`). It provides auth, a Postgres database with row-level
security, and auto-generated REST APIs the app calls straight from the browser
via `../js/albadary-api.js`.

- API URL: `https://tiwetfxfubjdrgtbwimm.supabase.co`
- Publishable key: `sb_publishable_pHZPYHcS6mdM5_LWbZlB0A_VHSvSoFp`
  (safe to ship in client code; row-level security governs all access)
- Dashboard: https://supabase.com/dashboard/project/tiwetfxfubjdrgtbwimm

## Data model

| Table | Purpose |
|---|---|
| `profiles` | One row per user: display name, role (`student` / `teacher` / `parent`), settings. Created automatically on signup by a trigger. |
| `surahs` | Reference data for the 114 surahs (names, ayah counts, revelation place). Read-only. Quran *text* is never stored — the app fetches it client-side from a Quran API; the database stores only surah/ayah references. |
| `ayah_progress` | Per-ayah memorization state with SM-2 spaced-repetition fields (`ease`, `interval_days`, `next_review_at`). |
| `memorization_plans` | A target range (e.g. Juz Amma), daily ayah goal, and optional target date. |
| `sessions` | Activity log: `read`, `recite`, `review`, and `quiz` sessions with optional score and duration. |
| `reading_positions` | Mushaf resume point (one row per user). |
| `teacher_links` / `parent_links` | Requests and active relationships. Either party requests; the other party accepts or declines. |
| `student_overview` (view) | Aggregated stats (memorized/learning counts, reviews due, last activity) for home, progress, teacher, and parent screens. |

Ayah numbers are validated against each surah's ayah count by a trigger, and
the seeded surah table was checksum-verified (114 surahs, 6236 ayahs total)
with spot checks against quran.com metadata.

## Access rules (row-level security)

- Everyone can read `surahs`.
- Users read and write only their own progress, plans, sessions, and reading
  position.
- Teacher profiles are visible to all signed-in users (the teachers
  directory); other profiles are visible only to the owner and linked users.
- A teacher or parent with an **active** link can read (not write) their
  student's/child's progress, plans, sessions, and overview.
- Link requests can only be accepted by the party who didn't send them.

## Migrations

The SQL in `migrations/` mirrors the migration history applied to the
project, in order:

1. `001_core_schema.sql` — tables, triggers, validation
2. `002_rls_policies.sql` — row-level security and the overview view
3. `003_seed_surahs.sql` — surah reference data
4. `004_lock_down_definer_functions.sql` — API hardening

To recreate the backend on a fresh Supabase project, run them in order in the
SQL editor (or `supabase db push` with these as migration files).

## Known accepted warnings

Supabase's security linter warns that `is_teacher_of`, `is_parent_of`, and
`is_linked_with` (SECURITY DEFINER) are executable by signed-in users. This
is required: RLS policies evaluate them with the caller's privileges. They
only answer questions about the caller's *own* links, so they expose nothing
the caller can't already see.
