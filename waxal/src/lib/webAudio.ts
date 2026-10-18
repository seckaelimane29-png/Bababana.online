/**
 * Browser-only helpers: pull a small 16 kHz mono WAV out of a video so caption requests upload
 * a few MB instead of the whole video (much faster and more reliable on mobile data).
 */

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const write = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };
  write(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  write(8, 'WAVE');
  write(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

type Trim = { delay: number; start: number; length: number };

/**
 * Reads the edit list of an MP4/MOV: videos trimmed in the iPhone Photos app keep the whole recording
 * and only mark where playback starts. Returns that start (seconds into the audio) and the kept length.
 */
export async function readTrim(blob: Blob): Promise<Trim | null> {
  const read = async (from: number, len: number) => new DataView(await blob.slice(from, from + len).arrayBuffer());
  // Find the moov box at the top level (it can be at the start or the end of the file).
  let pos = 0;
  let moov: DataView | null = null;
  while (pos + 8 <= blob.size) {
    const h = await read(pos, 16);
    let size = h.getUint32(0);
    const type = String.fromCharCode(h.getUint8(4), h.getUint8(5), h.getUint8(6), h.getUint8(7));
    let header = 8;
    if (size === 1) {
      size = Number(h.getBigUint64(8));
      header = 16;
    } else if (size === 0) size = blob.size - pos;
    if (size < header) return null;
    if (type === 'moov') {
      moov = await read(pos + header, size - header);
      break;
    }
    pos += size;
  }
  if (!moov) return null;
  const v = moov;
  type Box = { type: string; start: number; end: number };
  const children = (start: number, end: number): Box[] => {
    const out: Box[] = [];
    let p = start;
    while (p + 8 <= end) {
      const size = v.getUint32(p);
      const type = String.fromCharCode(v.getUint8(p + 4), v.getUint8(p + 5), v.getUint8(p + 6), v.getUint8(p + 7));
      if (size < 8 || p + size > end) break;
      out.push({ type, start: p + 8, end: p + size });
      p += size;
    }
    return out;
  };
  const find = (boxes: Box[], type: string) => boxes.find((b) => b.type === type);
  const timescale = (b: Box | undefined) => (b ? v.getUint32(b.start + (v.getUint8(b.start) === 1 ? 20 : 12)) : 0);
  const top = children(0, v.byteLength);
  const movieScale = timescale(find(top, 'mvhd'));
  if (!movieScale) return null;
  let best: Trim | null = null;
  for (const trak of top.filter((b) => b.type === 'trak')) {
    const tb = children(trak.start, trak.end);
    const mdia = find(tb, 'mdia');
    const edts = find(tb, 'edts');
    if (!mdia || !edts) continue;
    const mb = children(mdia.start, mdia.end);
    const hdlr = find(mb, 'hdlr');
    const kind = hdlr ? String.fromCharCode(v.getUint8(hdlr.start + 8), v.getUint8(hdlr.start + 9), v.getUint8(hdlr.start + 10), v.getUint8(hdlr.start + 11)) : '';
    const mediaScale = timescale(find(mb, 'mdhd'));
    const elst = find(children(edts.start, edts.end), 'elst');
    if (!elst || !mediaScale || (kind !== 'soun' && kind !== 'vide')) continue;
    const version = v.getUint8(elst.start);
    const count = v.getUint32(elst.start + 4);
    let p = elst.start + 8;
    let delay = 0;
    let trim: Trim | null = null;
    for (let i = 0; i < count && p < elst.end; i++) {
      const duration = version === 1 ? Number(v.getBigUint64(p)) : v.getUint32(p);
      const mediaTime = version === 1 ? Number(v.getBigInt64(p + 8)) : v.getInt32(p + 4);
      p += version === 1 ? 20 : 12;
      if (mediaTime === -1) delay += duration / movieScale;
      else {
        trim = { delay, start: mediaTime / mediaScale, length: duration / movieScale };
        break;
      }
    }
    if (trim && (kind === 'soun' || !best)) best = trim;
  }
  return best;
}

/** Returns a 16 kHz mono WAV of the video's audio, or null if this browser can't decode it. */
export async function extractAudioWav(uri: string): Promise<Blob | null> {
  try {
    const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    const Ctx = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctx || typeof OfflineAudioContext === 'undefined') return null;
    const blob = await (await fetch(uri)).blob();
    const trim = await readTrim(blob).catch(() => null);
    const data = await blob.arrayBuffer();
    const ctx = new Ctx();
    // Callback form: older Safari doesn't return a promise from decodeAudioData.
    const decoded = await new Promise<AudioBuffer>((resolve, reject) => ctx.decodeAudioData(data, resolve, reject));
    ctx.close?.();
    // The browser decodes the whole recording, ignoring a Photos trim: cut the audio to what the video plays,
    // or every caption lands late by the trimmed seconds.
    let delay = 0;
    let start = 0;
    let length = decoded.duration;
    if (trim && trim.start > 0.05 && decoded.duration > trim.length + 0.25) {
      delay = trim.delay;
      start = Math.min(trim.start, decoded.duration);
      length = Math.min(trim.length - trim.delay, decoded.duration - start);
    }
    const rate = 16000;
    const offline = new OfflineAudioContext(1, Math.max(1, Math.ceil((delay + length) * rate)), rate);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start(delay, start, length);
    const rendered = await offline.startRendering();
    return encodeWav(rendered.getChannelData(0), rate);
  } catch {
    return null;
  }
}

/** Multipart POST with upload progress (fetch can't report it). */
export function postForm(url: string, form: FormData, headers: Record<string, string>, onProgress?: (p: number) => void): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    if (onProgress) xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => resolve({ status: xhr.status, body: xhr.responseText });
    xhr.onerror = () => reject(new TypeError('Load failed'));
    xhr.ontimeout = () => reject(new TypeError('Load failed'));
    xhr.send(form);
  });
}

/** Send a big file in small pieces (iPhone Safari fails on one huge upload). Returns the server's upload id. */
export async function uploadInChunks(base: string, blob: Blob, headers: Record<string, string>, onProgress?: (p: number) => void): Promise<string> {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `u${Date.now()}${Math.random().toString(36).slice(2)}`;
  const size = 2 * 1024 * 1024;
  for (let offset = 0; offset < blob.size || offset === 0; offset += size) {
    const piece = blob.slice(offset, offset + size);
    for (let attempt = 0; ; attempt++) {
      try {
        const res = await sendChunk(`${base}/upload/${id}/chunk?offset=${offset}`, piece, headers);
        if (res.status >= 400) throw new Error(`Upload failed (${res.status}): ${res.body.slice(0, 200)}`);
        break;
      } catch (e) {
        if (attempt >= 3) throw e; // a phone connection blips; retry the same piece a few times
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
    onProgress?.(Math.min(1, (offset + piece.size) / Math.max(1, blob.size)));
    if (blob.size === 0) break;
  }
  return id;
}

function sendChunk(url: string, piece: Blob, headers: Record<string, string>): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.onload = () => resolve({ status: xhr.status, body: xhr.responseText });
    xhr.onerror = () => reject(new TypeError('Load failed'));
    xhr.ontimeout = () => reject(new TypeError('Load failed'));
    xhr.send(piece);
  });
}
