// WAXAL API server.
// - POST /api/transcribe : forwards the uploaded video to ElevenLabs Scribe (wo)
// - Serves the built frontend from ../dist when it exists (production / Emergent)
import express from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

// Minimal .env loader (no dependency): real environment always wins.
const envPath = path.join(root, '.env')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
}

const PORT = Number(process.env.PORT) || 8787
const MAX_BYTES = 200 * 1024 * 1024 // 200MB
const LISTEN_TIMEOUT_MS = 90_000 // Listening max 90s
const ELEVENLABS_URL = 'https://api.elevenlabs.io/v1/speech-to-text'

const app = express()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES },
})

const fail = (res, status, code, message) =>
  res.status(status).json({ error: { code, message } })

// Group flat word timings into caption cues:
// new cue when silence gap > 0.55s, cue text would pass ~32 chars, or cue spans > 4.5s.
export function groupCues(words) {
  const cues = []
  let cur = null
  for (const w of words) {
    if (cur) {
      const gap = w.start - cur.end
      const chars = cur.text.length + 1 + w.text.length
      const span = w.end - cur.start
      if (gap > 0.55 || chars > 32 || span > 4.5) {
        cues.push(cur)
        cur = null
      }
    }
    if (cur) {
      cur.text += ' ' + w.text
      cur.end = w.end
      cur.words.push(w)
    } else {
      cur = { start: w.start, end: w.end, text: w.text, words: [w] }
    }
  }
  if (cur) cues.push(cur)
  return cues
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, hasKey: Boolean(process.env.ELEVENLABS_API_KEY) })
})

app.post('/api/transcribe', (req, res) => {
  upload.single('video')(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return fail(res, 413, 'file_too_large', 'That video is over 200MB. Trim it and try again.')
      }
      return fail(res, 400, 'bad_upload', 'Could not read the uploaded video.')
    }

    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      return fail(res, 500, 'no_api_key',
        'ELEVENLABS_API_KEY is not set on the server. Add it to .env (see .env.example) and restart.')
    }
    if (!req.file || req.file.size === 0) {
      return fail(res, 400, 'no_file', 'No video received. Send an mp4/mov as multipart field "video".')
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), LISTEN_TIMEOUT_MS)
    // If the browser cancels the upload, stop the upstream call too.
    req.on('close', () => { if (!res.headersSent) controller.abort() })

    try {
      const form = new FormData()
      form.append(
        'file',
        new Blob([req.file.buffer], { type: req.file.mimetype || 'video/mp4' }),
        req.file.originalname || 'video.mp4',
      )
      form.append('model_id', 'scribe_v2')
      form.append('language_code', 'wo')
      form.append('timestamps_granularity', 'word')

      const upstream = await fetch(ELEVENLABS_URL, {
        method: 'POST',
        headers: { 'xi-api-key': apiKey },
        body: form,
        signal: controller.signal,
      })

      const bodyText = await upstream.text()
      let data = null
      try { data = JSON.parse(bodyText) } catch { /* non-JSON upstream body */ }

      if (upstream.status === 401) {
        return fail(res, 401, 'unauthorized',
          'ElevenLabs rejected the API key (401 on speech_to_text). Check ELEVENLABS_API_KEY.')
      }
      if (!upstream.ok) {
        const detail =
          data?.detail?.message || data?.detail?.status ||
          (typeof data?.detail === 'string' ? data.detail : '') || upstream.statusText
        return fail(res, 502, 'scribe_error',
          `ElevenLabs Scribe failed (HTTP ${upstream.status}${detail ? `: ${detail}` : ''}).`)
      }

      const words = (Array.isArray(data?.words) ? data.words : [])
        .filter((w) => w.type === 'word' && typeof w.start === 'number' && typeof w.end === 'number')
        .map((w) => ({ text: String(w.text).trim(), start: w.start, end: w.end }))
        .filter((w) => w.text.length > 0)

      if (words.length === 0) {
        return fail(res, 422, 'empty_transcript',
          'Scribe heard no words in this video. Check that the clip has audible speech.')
      }

      const lastEnd = words[words.length - 1].end
      return res.json({
        words,
        cues: groupCues(words),
        language_code: data.language_code || 'wo',
        audio_duration_secs:
          typeof data.audio_duration === 'number' ? data.audio_duration : lastEnd,
      })
    } catch (e) {
      if (controller.signal.aborted) {
        if (res.headersSent) return
        return fail(res, 504, 'timeout',
          'Listening timed out after 90 seconds. Try a shorter clip.')
      }
      console.error('transcribe error:', e)
      return fail(res, 502, 'network_error',
        'Could not reach ElevenLabs. Check the server’s network and try again.')
    } finally {
      clearTimeout(timer)
    }
  })
})

// Production: serve the built frontend from the same port.
const dist = path.join(root, 'dist')
if (fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next()
    res.sendFile(path.join(dist, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`WAXAL api listening on http://localhost:${PORT}`)
  if (!process.env.ELEVENLABS_API_KEY) {
    console.warn('WARNING: ELEVENLABS_API_KEY is not set — /api/transcribe will return an error banner.')
  }
})
