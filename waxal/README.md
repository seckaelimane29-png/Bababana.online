# WAXAL — Wolof short-form caption studio

Mobile-first, one-page caption studio for Wolof short-form video. Upload **your** mp4/mov (≤200MB), tap **Generate**, and WAXAL sends **that file** to **ElevenLabs Scribe** (`scribe_v2`, `language_code=wo`, word timestamps). The live overlay, cue editor, and every export come from that Scribe response only — a new file means new words. There is no stored Wolof script; the only canned text is behind the explicit **“Use sample text”** button (for trying styles before you transcribe).

**WAXAL renders a live caption overlay and exports SRT/transcript/JSON — it does not burn captions into an MP4.**

## Features

- 9:16 player, dark `#0A0B0D` / gold `#E8B86D` / cream UI
- **Generate** → “Listening” (max 90s, video plays while Scribe listens) with **Cancel**
- Word-accurate overlay (`timeupdate` + `requestAnimationFrame`, active word = `start <= t < end`), full word list — not just the first sentence
- Caption presets: **Viral CapCut** (default: 2–4 word cues, white + black stroke, active word yellow & scaled), CapCut Pop, Karaoke, Boxed, Apple Kinetic, Neon, Typewriter
- Cues grouped from word timings: new cue on gap > 0.55s, ~32 chars, or 4.5s span
- **Look** tab: CSS filters (presets + brightness/contrast/saturation/warmth sliders) — preview only, never modifies your file
- **Graphics** tab: film grain, letterbox bars, emoji stickers kept out of the lower-third caption safe area
- Exports: **SRT**, **Transcript (.txt)**, **JSON**, **Copy Claude Design prompt**
- Real error banners (no key, bad key/401, timeout, empty transcript, file too large) — never fake text

## Stack

- Frontend: Vite + React + TypeScript (`src/`)
- API: Express (`server/index.mjs`) — `POST /api/transcribe`, multipart field **`video`**
- No auth, no database, no Stripe. The only secret is `ELEVENLABS_API_KEY`, read from the environment.

## Quick start

Requires Node 18.13+.

```bash
npm install
cp .env.example .env        # then paste your ElevenLabs API key into .env
npm run dev
```

- Frontend: http://localhost:5173 (Vite, proxies `/api` to the API)
- API: http://localhost:8787

`.env`:

```bash
ELEVENLABS_API_KEY=your_key_here
```

Never commit a real key — `.env` is gitignored and only `.env.example` (empty) ships in the repo.

## Production build

```bash
npm run build     # outputs dist/
npm start         # Express serves dist/ AND /api/transcribe on one port (PORT, default 8787)
```

## Deploy on Emergent

The app is a single Node service — Express serves the built frontend and the API from one port:

1. Import this project (or the zip) into Emergent.
2. Set the environment variable `ELEVENLABS_API_KEY` in Emergent’s environment/secrets settings — never in the code.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Emergent injects `PORT`; the server binds `process.env.PORT` automatically.

Health check: `GET /api/health` → `{ ok: true, hasKey: true|false }`.

## API

### `POST /api/transcribe`

Multipart form, field **`video`** = the user’s mp4/mov (≤200MB). The server forwards it to
`https://api.elevenlabs.io/v1/speech-to-text` with header `xi-api-key` and fields
`model_id=scribe_v2`, `language_code=wo`, `timestamps_granularity=word`, then maps **all** items
with `type === "word"` and groups cues (gap > 0.55s / ~32 chars / 4.5s).

Success `200`:

```json
{
  "words": [{ "text": "salaam", "start": 0.12, "end": 0.48 }],
  "cues": [{ "start": 0.12, "end": 1.9, "text": "salaam aleekum", "words": [] }],
  "language_code": "wo",
  "audio_duration_secs": 42.6
}
```

Errors (all shown as a real banner in the UI, never replaced with fake text):

| Status | code               | When |
| ------ | ------------------ | ---- |
| 500    | `no_api_key`       | `ELEVENLABS_API_KEY` missing on the server |
| 401    | `unauthorized`     | ElevenLabs rejected the key |
| 504    | `timeout`          | Scribe didn’t answer within 90s |
| 422    | `empty_transcript` | Scribe heard no words in the clip |
| 413    | `file_too_large`   | Upload over 200MB |
| 400    | `no_file`          | Missing multipart field `video` |
| 502    | `scribe_error` / `network_error` | Upstream failure |

## Project layout

```
waxal/
├── index.html              # Vite entry
├── server/index.mjs        # Express: /api/transcribe + serves dist/ in production
├── src/
│   ├── App.tsx             # one-page studio (player, tabs, exports)
│   ├── components/CaptionOverlay.tsx
│   ├── lib/cues.ts         # cue grouping + retiming after edits
│   ├── lib/export.ts       # SRT / transcript / JSON / Claude Design prompt
│   ├── lib/presets.ts      # caption + look presets, stickers
│   ├── lib/sample.ts       # optional sample text (explicit tap only)
│   ├── styles.css
│   └── types.ts
├── .env.example
└── README.md
```
