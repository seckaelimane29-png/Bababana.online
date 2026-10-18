import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import { buildASS } from './ass.js';
import { timelineDuration } from './timeline.js';

export function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args);
    let out = '';
    let err = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (err += d));
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve(out) : reject(new Error(`${cmd} exited ${code}: ${err.slice(-800)}`))));
  });
}

/** Display size (after rotation metadata) and whether the file has audio. */
export async function probe(file) {
  const json = JSON.parse(await run('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', file]));
  const v = json.streams.find((s) => s.codec_type === 'video');
  if (!v) throw new Error('No video stream found');
  let rotation = Number(v.tags?.rotate ?? 0);
  for (const sd of v.side_data_list ?? []) if (sd.rotation != null) rotation = Number(sd.rotation);
  const swap = Math.abs(rotation) % 180 === 90;
  return {
    width: swap ? v.height : v.width,
    height: swap ? v.width : v.height,
    hasAudio: json.streams.some((s) => s.codec_type === 'audio'),
    duration: Number(json.format?.duration ?? v.duration ?? 0),
  };
}

function even(n) {
  return Math.max(2, Math.round(n / 2) * 2);
}

/** atempo only accepts 0.5..2 per instance, so chain it. */
function atempoChain(speed) {
  const parts = [];
  let s = speed;
  while (s > 2) {
    parts.push('atempo=2');
    s /= 2;
  }
  while (s < 0.5) {
    parts.push('atempo=0.5');
    s /= 0.5;
  }
  parts.push(`atempo=${s.toFixed(4)}`);
  return parts.join(',');
}

/** Pieces of an overlay that survive the cuts: timeline [t0, t1) and where that starts inside the overlay's media (m0). */
function overlaySegments(clips, o) {
  const out = [];
  let acc = 0;
  for (const c of clips) {
    const s0 = Math.max(o.start, c.start);
    const s1 = Math.min(o.end, c.end);
    if (s1 - s0 > 0.01) out.push({ t0: acc + (s0 - c.start), t1: acc + (s1 - c.start), m0: (o.srcStart || 0) + (s0 - o.start) });
    acc += c.end - c.start;
  }
  return out;
}

/** Saves each overlay picture (sent as a data: URL) to disk and checks overlay videos; skips anything unusable. */
async function writeOverlays(images, workDir) {
  const out = [];
  for (const [i, o] of (Array.isArray(images) ? images : []).entries()) {
    if (!(o?.end > o?.start) || !(o.w > 0) || !(o.aspect > 0)) continue;
    const common = { start: Number(o.start), end: Number(o.end), x: Number(o.x) || 0.5, y: Number(o.y) || 0.5, w: Math.min(3, Number(o.w)), aspect: Math.min(10, Number(o.aspect)) };
    if (o.kind === 'video') {
      if (!o.file) continue;
      const info = await probe(o.file).catch(() => null);
      if (!info) continue;
      out.push({ ...common, kind: 'video', file: o.file, srcStart: Math.max(0, Number(o.srcStart) || 0), sound: !!o.sound, hasAudio: info.hasAudio });
      continue;
    }
    const m = /^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/s.exec(String(o.data || ''));
    if (!m) continue;
    const file = path.join(workDir, `overlay-${i}.${m[1] === 'jpeg' ? 'jpg' : m[1]}`);
    await writeFile(file, Buffer.from(m[2], 'base64'));
    out.push({ ...common, kind: 'image', file });
  }
  return out.slice(0, 20);
}

export async function renderProject({ input, project, workDir, fontsDir, onProgress }) {
  const info = await probe(input);
  const clips = (project.clips?.length ? project.clips : [{ start: 0, end: info.duration }]).map((c) => ({
    start: Math.max(0, c.start),
    end: Math.min(info.duration || c.end, c.end),
  })).filter((c) => c.end - c.start > 0.02);
  if (!clips.length) throw new Error('Nothing to render: all clips are empty');
  project = { ...project, clips };

  // Output size.
  let W = info.width;
  let H = info.height;
  const target = project.quality === '720' ? 720 : project.quality === '1080' ? 1080 : null;
  if (target && Math.min(W, H) > target) {
    const k = target / Math.min(W, H);
    W = even(W * k);
    H = even(H * k);
  } else {
    W = even(W);
    H = even(H);
  }

  const assPath = path.join(workDir, 'subs.ass');
  await writeFile(assPath, buildASS(project, W, H));

  const speed = Math.min(4, Math.max(0.25, Number(project.speed) || 1));
  const volume = Math.max(0, Number(project.volume ?? 1));
  const n = clips.length;
  const f = [];
  const vSplit = clips.map((_, i) => `[vs${i}]`).join('');
  f.push(n > 1 ? `[0:v]split=${n}${vSplit}` : `[0:v]null[vs0]`);
  if (info.hasAudio) f.push(n > 1 ? `[0:a]asplit=${n}${clips.map((_, i) => `[as${i}]`).join('')}` : `[0:a]anull[as0]`);
  clips.forEach((c, i) => {
    f.push(`[vs${i}]trim=start=${c.start.toFixed(3)}:end=${c.end.toFixed(3)},setpts=PTS-STARTPTS[v${i}]`);
    if (info.hasAudio) f.push(`[as${i}]atrim=start=${c.start.toFixed(3)}:end=${c.end.toFixed(3)},asetpts=PTS-STARTPTS[a${i}]`);
  });
  const concatIn = clips.map((_, i) => (info.hasAudio ? `[v${i}][a${i}]` : `[v${i}]`)).join('');
  f.push(`${concatIn}concat=n=${n}:v=1:a=${info.hasAudio ? 1 : 0}${info.hasAudio ? '[vc][ac]' : '[vc]'}`);
  const assArg = assPath.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'");
  const fontsArg = fontsDir.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'");
  // Picture and video overlays sit above the video and below captions/texts.
  const overlays = await writeOverlays(project.images, workDir);
  f.push(`[vc]scale=${W}:${H}:flags=lanczos,setsar=1[base0]`);
  let base = '[base0]';
  const overlayAudio = [];
  for (const [i, o] of overlays.entries()) {
    const segs = overlaySegments(clips, o);
    if (!segs.length) continue;
    const w = even(Math.max(2, o.w * W));
    const h = even(Math.max(2, w * o.aspect));
    const x = Math.round(o.x * W - w / 2);
    const y = Math.round(o.y * H - h / 2);
    const input = `[${i + 1}:v]`;
    if (o.kind !== 'video') {
      const enable = segs.map((g) => `between(t,${g.t0.toFixed(3)},${g.t1.toFixed(3)})`).join('+');
      f.push(`${input}scale=${w}:${h},format=rgba[img${i}]`);
      f.push(`${base}[img${i}]overlay=x=${x}:y=${y}:enable='${enable}':eof_action=repeat[ov${i}]`);
      base = `[ov${i}]`;
      continue;
    }
    // A video overlay keeps playing in step with the main video, so each cut piece takes its matching part.
    f.push(segs.length > 1 ? `${input}split=${segs.length}${segs.map((_, j) => `[vin${i}_${j}]`).join('')}` : `${input}null[vin${i}_0]`);
    segs.forEach((g, j) => {
      f.push(`[vin${i}_${j}]trim=start=${g.m0.toFixed(3)}:duration=${(g.t1 - g.t0).toFixed(3)},setpts=PTS-STARTPTS+${g.t0.toFixed(3)}/TB,scale=${w}:${h},setsar=1,format=rgba[vp${i}_${j}]`);
      f.push(`${base}[vp${i}_${j}]overlay=x=${x}:y=${y}:enable='between(t,${g.t0.toFixed(3)},${g.t1.toFixed(3)})':eof_action=pass[ov${i}_${j}]`);
      base = `[ov${i}_${j}]`;
    });
    if (o.sound && o.hasAudio && info.hasAudio) {
      f.push(segs.length > 1 ? `[${i + 1}:a]asplit=${segs.length}${segs.map((_, j) => `[ain${i}_${j}]`).join('')}` : `[${i + 1}:a]anull[ain${i}_0]`);
      segs.forEach((g, j) => {
        const ms = Math.round(g.t0 * 1000);
        f.push(`[ain${i}_${j}]atrim=start=${g.m0.toFixed(3)}:duration=${(g.t1 - g.t0).toFixed(3)},asetpts=PTS-STARTPTS,adelay=delays=${ms}:all=1[ap${i}_${j}]`);
        overlayAudio.push(`[ap${i}_${j}]`);
      });
    }
  }
  if (overlayAudio.length) {
    f.push(`[ac]${overlayAudio.join('')}amix=inputs=${overlayAudio.length + 1}:duration=first:normalize=0[acm]`);
  }
  f.push(`${base}ass=filename='${assArg}':fontsdir='${fontsArg}',setpts=PTS/${speed},format=yuv420p[vout]`);
  if (info.hasAudio) f.push(`${overlayAudio.length ? '[acm]' : '[ac]'}volume=${volume.toFixed(3)},${atempoChain(speed)}[aout]`);

  const out = path.join(workDir, 'output.mp4');
  const expected = timelineDuration(clips) / speed;
  const args = [
    '-y', '-hide_banner', '-nostats', '-progress', 'pipe:1',
    '-i', input,
    ...overlays.flatMap((o) => ['-i', o.file]),
    '-filter_complex', f.join(';'),
    '-map', '[vout]',
    ...(info.hasAudio ? ['-map', '[aout]', '-c:a', 'aac', '-b:a', '160k'] : []),
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-profile:v', 'high',
    '-movflags', '+faststart',
    out,
  ];

  await new Promise((resolve, reject) => {
    const p = spawn('ffmpeg', args);
    let err = '';
    p.stderr.on('data', (d) => (err = (err + d).slice(-4000)));
    p.stdout.on('data', (d) => {
      const m = /out_time_us=(\d+)/.exec(String(d));
      if (m && expected > 0) onProgress?.(Math.min(0.99, Number(m[1]) / 1e6 / expected));
    });
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg failed (${code}): ${err.slice(-600)}`))));
  });
  onProgress?.(1);
  return { file: out, width: W, height: H };
}

/** Small mono MP3 for speech-to-text (keeps uploads under OpenAI's 25 MB limit for long videos). */
/** Lossless 16 kHz mono WAV for ElevenLabs (no MP3 artefacts on hard-to-hear Wolof sounds). */
export async function extractAudioWav(input, out) {
  await run('ffmpeg', ['-y', '-hide_banner', '-i', input, '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'pcm_s16le', '-f', 'wav', out]);
  return out;
}

export async function extractAudio(input, out) {
  await run('ffmpeg', ['-y', '-hide_banner', '-i', input, '-vn', '-ac', '1', '-ar', '16000', '-b:a', '48k', '-f', 'mp3', out]);
  return out;
}
