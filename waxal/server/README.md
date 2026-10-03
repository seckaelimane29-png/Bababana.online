# Waxal server

Small Node + ffmpeg service used by the app for:

- `POST /render`: upload video + project JSON → MP4 with cuts, speed, volume and **burned-in animated captions** (same fonts, colors and word highlight as the app preview). Poll `GET /render/:id`, download `GET /render/:id/file`.
- `POST /transcribe`: extracts a small mono MP3 with ffmpeg, then gets word timestamps from **ElevenLabs Scribe** (default, supports Wolof) or OpenAI Whisper (`provider=openai`).
- `POST /ai/chat`: proxies translate / keyword requests so the OpenAI key stays on the server.
- `GET /health`

## Run

```bash
cd server
npm install
ELEVENLABS_API_KEY=... OPENAI_API_KEY=sk-... npm start          # needs ffmpeg on PATH
```

Or with Docker (ffmpeg included):

```bash
docker build -t waxal-server .
docker run -p 8787:8787 -e ELEVENLABS_API_KEY=... -e OPENAI_API_KEY=sk-... -e WAXAL_API_TOKEN=choose-a-secret waxal-server
```

Then in the app: **Settings → Waxal server URL** = `https://your-host` (and the same token in **Server token**).

| Env var | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8787` | HTTP port |
| `ELEVENLABS_API_KEY` | — | Captions via ElevenLabs Scribe (recommended, supports Wolof) |
| `OPENAI_API_KEY` | — | `/ai/chat` (translate, keywords) and OpenAI captions |
| `WAXAL_API_TOKEN` | — | If set, every request must send `x-waxal-token` |
| `WAXAL_CHAT_MODEL` | — | Force a chat model for `/ai/chat` |
| `MAX_UPLOAD_MB` | `1024` | Upload limit |

Deploy anywhere that runs Docker (Render, Railway, Fly.io, a VPS). Renders run one at a time and are deleted after an hour.

```bash
npm test   # caption (ASS) generation tests
```
