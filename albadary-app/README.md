# Albadary — Quran Learning App (design mockup)

Interactive mobile UI mockup for **Albadary**, a Quran learning app: "Learn, recite, and keep what you memorize."

## Screens

The prototype covers the full app flow inside a phone frame:

- Login / onboarding
- Home dashboard
- Read & Mushaf view (surah list, surah reader, verse mode)
- Learn / memorization plan
- Recite & Review sessions
- Quiz
- Progress tracking
- Teachers directory & teacher profile
- Parent view
- Profile & Settings

Design language: dark olive background with gold accents, Outfit for UI text and Amiri for Arabic script.

## Files

- `index.html` — self-contained build of the design canvas. All assets (fonts, React, runtime) are embedded, so it opens directly in any browser, online or offline.
- `design/Quran Learning App.dc.html` — the editable design source (Claude Design canvas format).
- `design/support.js` — the canvas runtime the design source loads.
- `js/albadary-api.js` — browser client for the live backend (auth, progress, plans, sessions, teacher/parent links).
- `backend/` — the Supabase backend: data model and access-rule docs, plus the SQL migrations applied to the live project. See `backend/README.md`.

To view the mockup, just open `index.html` in a browser.

## Backend

The app has a live backend on Supabase (auth + Postgres with row-level
security + REST API). See [`backend/README.md`](backend/README.md) for the
data model, access rules, and API details, and use `js/albadary-api.js`
from app code.
