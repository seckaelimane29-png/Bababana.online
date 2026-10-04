import cors from 'cors';
import express from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { copyFileSync, createReadStream, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { readFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';

import { extractAudio, renderProject } from './render.js';

const PORT = Number(process.env.PORT || 8787);
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const ELEVENLABS_KEY = process.env.ELEVENLABS_API_KEY || '';
const TOKEN = process.env.WAXAL_API_TOKEN || '';
const CHAT_MODEL = process.env.WAXAL_CHAT_MODEL || '';
const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB || 1024);
// Per-visitor cap on the paid endpoints (captions, AI, renders) so a leaked token can't drain your credit.
const RATE_LIMIT_PER_HOUR = Number(process.env.RATE_LIMIT_PER_HOUR || 40);
const ROOT = path.join(os.tmpdir(), 'waxal');
const UPLOADS = path.join(ROOT, 'uploads');
const JOBS = path.join(ROOT, 'jobs');
const FONTS = path.join(ROOT, 'fonts');
for (const d of [UPLOADS, JOBS, FONTS]) mkdirSync(d, { recursive: true });

// Caption fonts: the exact files the app uses, so exports match the preview.
const require = createRequire(import.meta.url);
for (const [pkg, file] of [
  ['@expo-google-fonts/montserrat', '900Black/Montserrat_900Black.ttf'],
  ['@expo-google-fonts/anton', '400Regular/Anton_400Regular.ttf'],
  ['@expo-google-fonts/bebas-neue', '400Regular/BebasNeue_400Regular.ttf'],
  ['@expo-google-fonts/poppins', '800ExtraBold/Poppins_800ExtraBold.ttf'],
  ['@expo-google-fonts/permanent-marker', '400Regular/PermanentMarker_400Regular.ttf'],
  ['@expo-google-fonts/inter', '800ExtraBold/Inter_800ExtraBold.ttf'],
  ['@expo-google-fonts/playfair-display', '800ExtraBold_Italic/PlayfairDisplay_800ExtraBold_Italic.ttf'],
  ['@expo-google-fonts/dancing-script', '700Bold/DancingScript_700Bold.ttf'],
  ['@expo-google-fonts/oswald', '700Bold/Oswald_700Bold.ttf'],
  ['@expo-google-fonts/bangers', '400Regular/Bangers_400Regular.ttf'],
  ['@expo-google-fonts/archivo-black', '400Regular/ArchivoBlack_400Regular.ttf'],
  ['@expo-google-fonts/dm-serif-display', '400Regular_Italic/DMSerifDisplay_400Regular_Italic.ttf'],
  ['@expo-google-fonts/rubik', '900Black_Italic/Rubik_900Black_Italic.ttf'],
]) {
  const src = path.join(path.dirname(require.resolve(`${pkg}/package.json`)), file);
  copyFileSync(src, path.join(FONTS, path.basename(file)));
}

const app = express();
app.set('trust proxy', true); // Render sits behind a proxy; use the visitor's real IP.
app.use(cors());
app.use(express.json({ limit: '2mb' }));
const upload = multer({ dest: UPLOADS, limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024, fieldSize: 20 * 1024 * 1024 } });

app.use((req, res, next) => {
  if (!TOKEN || req.path === '/health') return next();
  const header = req.get('x-waxal-token') || req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (header === TOKEN || req.query.token === TOKEN) return next();
  res.status(401).json({ error: 'Invalid or missing server token' });
});

/** @type {Map<string, number[]>} */
const hits = new Map();
function rateLimit(req, res, next) {
  const now = Date.now();
  const key = req.ip || 'unknown';
  const recent = (hits.get(key) || []).filter((t) => now - t < 60 * 60 * 1000);
  if (recent.length >= RATE_LIMIT_PER_HOUR) {
    res.set('Retry-After', '600');
    return res.status(429).json({ error: 'Too many requests. Please wait a few minutes and try again.' });
  }
  recent.push(now);
  hits.set(key, recent);
  next();
}
setInterval(() => {
  const cutoff = Date.now() - 60 * 60 * 1000;
  for (const [k, list] of hits) if (!list.some((t) => t > cutoff)) hits.delete(k);
}, 10 * 60 * 1000).unref();

app.get('/health', (_req, res) => res.json({ ok: true, openai: !!OPENAI_KEY, elevenlabs: !!ELEVENLABS_KEY }));

// ---------- AI ----------

async function readJson(r) {
  const body = await r.text();
  try {
    return JSON.parse(body);
  } catch {
    throw Object.assign(new Error(`Unexpected response (${r.status}): ${body.slice(0, 200)}`), { status: 502 });
  }
}

async function transcribeElevenLabs(mp3, language) {
  const form = new FormData();
  form.append('file', new Blob([await readFile(mp3)], { type: 'audio/mpeg' }), 'audio.mp3');
  form.append('model_id', 'scribe_v2');
  form.append('timestamps_granularity', 'word');
  form.append('tag_audio_events', 'false');
  if (language) form.append('language_code', language);
  const r = await fetch('https://api.elevenlabs.io/v1/speech-to-text', { method: 'POST', headers: { 'xi-api-key': ELEVENLABS_KEY }, body: form });
  const data = await readJson(r);
  if (!r.ok) throw Object.assign(new Error(data?.detail?.message || data?.detail || 'Transcription failed'), { status: r.status });
  // ElevenLabs also returns spaces and audio events; keep only spoken words, in the shape the app expects.
  const words = (data.words || []).filter((w) => (w.type || 'word') === 'word').map((w) => ({ word: w.text, start: w.start, end: w.end }));
  return { words, language: data.language_code || null, text: data.text };
}

async function transcribeOpenAI(mp3, language) {
  const form = new FormData();
  form.append('file', new Blob([await readFile(mp3)], { type: 'audio/mpeg' }), 'audio.mp3');
  form.append('model', 'whisper-1');
  form.append('response_format', 'verbose_json');
  form.append('timestamp_granularities[]', 'word');
  if (language) form.append('language', language);
  const r = await fetch('https://api.openai.com/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${OPENAI_KEY}` }, body: form });
  const data = await readJson(r);
  if (!r.ok) throw Object.assign(new Error(data?.error?.message || 'Transcription failed'), { status: r.status });
  return { words: data.words || [], language: data.language || null, text: data.text };
}

app.post('/transcribe', rateLimit, upload.single('file'), async (req, res) => {
  const file = req.file;
  const mp3 = file ? `${file.path}.mp3` : null;
  try {
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    // Default to ElevenLabs (supports Wolof); fall back to whichever key the server has.
    const wanted = req.body.provider === 'openai' ? 'openai' : 'elevenlabs';
    const provider = wanted === 'elevenlabs' && ELEVENLABS_KEY ? 'elevenlabs' : OPENAI_KEY ? 'openai' : ELEVENLABS_KEY ? 'elevenlabs' : null;
    if (!provider) return res.status(500).json({ error: 'Server has no ELEVENLABS_API_KEY or OPENAI_API_KEY configured' });
    await extractAudio(file.path, mp3);
    const language = req.body.language ? String(req.body.language) : undefined;
    const result = provider === 'elevenlabs' ? await transcribeElevenLabs(mp3, language) : await transcribeOpenAI(mp3, language);
    res.json({ ...result, provider });
  } catch (e) {
    res.status(e.status || 500).json({ error: String(e.message || e) });
  } finally {
    if (file) rm(file.path, { force: true }).catch(() => {});
    if (mp3) rm(mp3, { force: true }).catch(() => {});
  }
});

app.post('/ai/chat', rateLimit, async (req, res) => {
  try {
    if (!OPENAI_KEY) return res.status(500).json({ error: 'Server has no OPENAI_API_KEY configured' });
    const { model, messages, response_format } = req.body || {};
    if (!Array.isArray(messages)) return res.status(400).json({ error: 'messages required' });
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: CHAT_MODEL || model || 'gpt-4o-mini', messages, response_format }),
    });
    res.status(r.status).json(await r.json());
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// ---------- render jobs ----------

/** @type {Map<string, {id:string, state:'queued'|'running'|'done'|'error', progress:number, error?:string, dir:string, input:string, project:any, output?:string, created:number}>} */
const jobs = new Map();
const queue = [];
let running = false;

async function pump() {
  if (running) return;
  const job = queue.shift();
  if (!job) return;
  running = true;
  job.state = 'running';
  try {
    const { file } = await renderProject({
      input: job.input,
      project: job.project,
      workDir: job.dir,
      fontsDir: FONTS,
      onProgress: (p) => (job.progress = p),
    });
    job.output = file;
    job.state = 'done';
    job.progress = 1;
  } catch (e) {
    job.state = 'error';
    job.error = String(e.message || e);
    console.error(`[render ${job.id}]`, job.error);
  } finally {
    rm(job.input, { force: true }).catch(() => {});
    running = false;
    pump();
  }
}

app.post('/render', rateLimit, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No video uploaded' });
  let project;
  try {
    project = JSON.parse(req.body.project || '{}');
  } catch {
    rm(req.file.path, { force: true }).catch(() => {});
    return res.status(400).json({ error: 'Invalid project JSON' });
  }
  const id = randomUUID();
  const dir = path.join(JOBS, id);
  mkdirSync(dir, { recursive: true });
  const job = { id, state: 'queued', progress: 0, dir, input: req.file.path, project, created: Date.now() };
  jobs.set(id, job);
  queue.push(job);
  pump();
  res.json({ id });
});

app.get('/render/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ state: 'error', error: 'Unknown job' });
  res.json({ state: job.state, progress: job.progress, error: job.error, position: job.state === 'queued' ? queue.indexOf(job) + 1 : 0 });
});

app.get('/render/:id/file', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job?.output || !existsSync(job.output)) return res.status(404).json({ error: 'Not ready' });
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Content-Length', statSync(job.output).size);
  res.setHeader('Content-Disposition', `attachment; filename="waxal-${job.id.slice(0, 8)}.mp4"`);
  createReadStream(job.output).pipe(res);
});

// Clean up renders after an hour.
setInterval(() => {
  const cutoff = Date.now() - 60 * 60 * 1000;
  for (const [id, job] of jobs) {
    if (job.created < cutoff && job.state !== 'running') {
      jobs.delete(id);
      rm(job.dir, { recursive: true, force: true }).catch(() => {});
    }
  }
  for (const f of readdirSync(UPLOADS)) {
    const p = path.join(UPLOADS, f);
    try {
      if (statSync(p).mtimeMs < cutoff) rm(p, { force: true }).catch(() => {});
    } catch {}
  }
}, 10 * 60 * 1000).unref();

app.listen(PORT, () => console.log(`Waxal server on :${PORT} (elevenlabs: ${ELEVENLABS_KEY ? 'yes' : 'no'}, openai: ${OPENAI_KEY ? 'yes' : 'no'}, token: ${TOKEN ? 'required' : 'off'})`));
