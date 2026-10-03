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
const TOKEN = process.env.WOOLF_API_TOKEN || '';
const CHAT_MODEL = process.env.WOOLF_CHAT_MODEL || '';
const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB || 1024);
const ROOT = path.join(os.tmpdir(), 'woolf');
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
]) {
  const src = path.join(path.dirname(require.resolve(`${pkg}/package.json`)), file);
  copyFileSync(src, path.join(FONTS, path.basename(file)));
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
const upload = multer({ dest: UPLOADS, limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024, fieldSize: 20 * 1024 * 1024 } });

app.use((req, res, next) => {
  if (!TOKEN || req.path === '/health') return next();
  const header = req.get('x-woolf-token') || req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (header === TOKEN || req.query.token === TOKEN) return next();
  res.status(401).json({ error: 'Invalid or missing server token' });
});

app.get('/health', (_req, res) => res.json({ ok: true, openai: !!OPENAI_KEY }));

// ---------- AI ----------

app.post('/transcribe', upload.single('file'), async (req, res) => {
  const file = req.file;
  try {
    if (!OPENAI_KEY) return res.status(500).json({ error: 'Server has no OPENAI_API_KEY configured' });
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    const mp3 = `${file.path}.mp3`;
    await extractAudio(file.path, mp3);
    const form = new FormData();
    form.append('file', new Blob([await readFile(mp3)], { type: 'audio/mpeg' }), 'audio.mp3');
    form.append('model', 'whisper-1');
    form.append('response_format', 'verbose_json');
    form.append('timestamp_granularities[]', 'word');
    if (req.body.language) form.append('language', String(req.body.language));
    const r = await fetch('https://api.openai.com/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${OPENAI_KEY}` }, body: form });
    const data = await r.json();
    await rm(mp3, { force: true });
    if (!r.ok) return res.status(r.status).json({ error: data?.error?.message || 'Transcription failed' });
    res.json({ words: data.words || [], language: data.language || null, text: data.text });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  } finally {
    if (file) rm(file.path, { force: true }).catch(() => {});
  }
});

app.post('/ai/chat', async (req, res) => {
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

app.post('/render', upload.single('file'), (req, res) => {
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
  res.setHeader('Content-Disposition', `attachment; filename="woolf-${job.id.slice(0, 8)}.mp4"`);
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

app.listen(PORT, () => console.log(`Woolf server on :${PORT} (openai: ${OPENAI_KEY ? 'yes' : 'no'}, token: ${TOKEN ? 'required' : 'off'})`));
