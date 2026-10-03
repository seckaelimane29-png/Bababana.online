# Woolf Captions server

Small Node + ffmpeg service used by the app for:

- `POST /render`: upload video + project JSON → MP4 with cuts, speed, volume and **burned-in animated captions** (same fonts, colors and word highlight as the app preview). Poll `GET /render/:id`, download `GET /render/:id/file`.
- `POST /transcribe`: extracts a small mono MP3 with ffmpeg, then calls Whisper with word timestamps. Works for long videos (the direct-from-phone path is limited to 25 MB).
- `POST /ai/chat`: proxies translate / keyword requests so the OpenAI key stays on the server.
- `GET /health`

## Run

```bash
cd server
npm install
OPENAI_API_KEY=sk-... npm start          # needs ffmpeg on PATH
```

Or with Docker (ffmpeg included):

```bash
docker build -t woolf-server .
docker run -p 8787:8787 -e OPENAI_API_KEY=sk-... -e WOOLF_API_TOKEN=choose-a-secret woolf-server
```

Then in the app: **Settings → Woolf server URL** = `https://your-host` (and the same token in **Server token**).

| Env var | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8787` | HTTP port |
| `OPENAI_API_KEY` | — | Needed for `/transcribe` and `/ai/chat` |
| `WOOLF_API_TOKEN` | — | If set, every request must send `x-woolf-token` |
| `WOOLF_CHAT_MODEL` | — | Force a chat model for `/ai/chat` |
| `MAX_UPLOAD_MB` | `1024` | Upload limit |

Deploy anywhere that runs Docker (Render, Railway, Fly.io, a VPS). Renders run one at a time and are deleted after an hour.

```bash
npm test   # caption (ASS) generation tests
```
