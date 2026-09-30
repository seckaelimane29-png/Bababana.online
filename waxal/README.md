# Waxal ✨

**Waxal** ("Speak!" in Wolof) is an AI caption generator for social media. Upload a
photo, pick a tone and a platform, and Waxal writes captions **in Wolof** — the way
people in Senegal actually write online — for Instagram, TikTok, Twitter/X and
LinkedIn.

- **Interface**: Wolof / French / English (switcher in the navbar)
- **Captions**: Wolof with natural French mixing (default), pure Wolof, or French
- **Business model**: free accounts get a monthly quota of generations; Pro
  subscribers get a much bigger one. Payments are designed for
  **PayDunya/CinetPay** (Wave, Orange Money, Free Money, cards) — see
  [Connecting payments](#connecting-payments).

Built as: React + TypeScript + Tailwind + Zustand frontend, FastAPI + SQLAlchemy
backend, Anthropic Claude (vision) for generation.

---

## Quick start (local)

You need **Python 3.11+** and **Node 18+**.

### 1. Backend

```bash
cd waxal/backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env: paste your ANTHROPIC_API_KEY (from https://console.anthropic.com)
#            and set a random JWT_SECRET (e.g. run: openssl rand -hex 32)
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend (second terminal)

```bash
cd waxal/frontend
npm install
cp .env.example .env              # default points at http://localhost:8000
npm run dev
```

Open http://localhost:5173, create an account, upload a photo, and press
**"Waxal! Defar captions"**.

To test the Pro flow without payments, set `DEV_FAKE_BILLING=true` in
`backend/.env` — the Upgrade button then activates Pro instantly. Never enable
this in production.

### Docker (backend only)

```bash
cd waxal
cp backend/.env.example backend/.env   # then fill it in
docker compose up --build
```

---

## Putting it online

The frontend is static files; the backend is a Python server. The simplest
production setup:

1. **Backend** → deploy `waxal/backend` to [Render](https://render.com) or
   [Railway](https://railway.app) (both detect the Dockerfile). Set the
   environment variables from `.env.example` in their dashboard — especially
   `ANTHROPIC_API_KEY`, a strong `JWT_SECRET`, and
   `CORS_ORIGINS=https://your-frontend-domain`.
   For real usage switch `DATABASE_URL` to the Postgres instance those hosts
   provide (SQLite works but doesn't survive redeploys on most hosts), and note
   that uploaded images on an ephemeral filesystem disappear on redeploy —
   attach a persistent disk (Render) or move uploads to Cloudinary later.
2. **Frontend** → `npm run build` in `waxal/frontend`, deploy the `dist/`
   folder to Netlify/Vercel/anywhere static (same hosting as the rest of
   bababana.online works). Set `VITE_API_BASE_URL` to your backend URL
   **before** building.

---

## Connecting payments

Stripe does not support businesses based in Senegal, so Waxal is designed for a
local payment aggregator. Recommended: **PayDunya** (paydunya.com) or
**CinetPay** (cinetpay.com) — both accept Wave, Orange Money, Free Money and
bank cards, which is what your customers actually use.

Steps when you're ready:

1. Create a merchant account at PayDunya or CinetPay and get API keys.
2. In `backend/app/routers/billing.py`, replace the `upgrade` handler body:
   create an invoice via the PSP's API for `PRO_PRICE_FCFA`, and return the
   PSP's payment URL to the frontend (redirect the user there).
3. Add a webhook endpoint (e.g. `POST /api/v1/billing/webhook`) that verifies
   the PSP's signature, then sets `user.plan = "pro"` and
   `user.pro_expires_at = now + 30 days`. The module docstring in `billing.py`
   describes this flow.
4. For renewals, mobile-money rails have no automatic recurring charge like
   cards — the standard pattern in Senegal is a reminder (email/WhatsApp) when
   `pro_expires_at` approaches, linking back to the payment page. Expiry is
   already enforced server-side: an expired Pro automatically behaves as Free.

Quotas and prices are just environment variables (`FREE_MONTHLY_GENERATIONS`,
`PRO_MONTHLY_GENERATIONS`, `PRO_PRICE_FCFA`) — tune them without touching code.

---

## Reviewing the Wolof

Two places contain Wolof written by an AI and should be **reviewed by a native
speaker** before launch:

- `frontend/src/i18n/index.ts` — the `wo` dictionary (UI labels). It
  deliberately uses the mixed register of Senegalese social media (words like
  *copier* or *historique* are kept in French where that's what people say).
- `backend/app/utils/prompts.py` — the instructions that tell Claude how to
  write Wolof captions. The captions themselves are generated fresh each time,
  and quality is best judged by generating on real photos and reading the
  results.

---

## Architecture

```
waxal/
├── backend/            FastAPI + SQLite/Postgres
│   └── app/
│       ├── routers/    auth, upload, generate/refine, history, billing
│       ├── services/   claude_service (vision → JSON captions), image_service
│       ├── models/     Pydantic schemas + SQLAlchemy tables
│       ├── db/         engine/session + queries
│       └── utils/      Wolof prompt engineering, JWT/bcrypt auth
└── frontend/           Vite + React + TS + Tailwind + Zustand
    └── src/
        ├── i18n/       wo / fr / en UI dictionaries
        ├── components/ UploadZone, selectors, CaptionCard, history, modals
        ├── store/      settings (lang/theme), auth, captions
        └── services/   typed API client
```

Key API endpoints (all under `/api/v1`): `POST /auth/register`, `POST
/auth/login`, `GET /auth/me`, `POST /upload`, `POST /generate`, `POST
/refine`, `GET|DELETE /history`, `POST /history/{id}/favorite`,
`GET /billing/plans`, `POST /billing/upgrade`. Errors always come back as
`{"error": {"code", "message", "status"}}`.

The generation model is configurable via `ANTHROPIC_MODEL` (default
`claude-sonnet-5`).

## Notes / deliberate choices

- The API key lives **only** on the backend; the browser never sees it.
- Generation requires an account so quotas (the thing subscribers pay for) are
  enforceable server-side.
- Uploads are validated by magic bytes (JPEG/PNG/WEBP), not just file name.
- Refinements don't consume the monthly quota; only full generations do.
- Rate limiting beyond quotas (e.g. slowapi per-IP limits on auth endpoints) is
  worth adding before heavy public exposure.
