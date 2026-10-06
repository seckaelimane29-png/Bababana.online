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

/** Returns a 16 kHz mono WAV of the video's audio, or null if this browser can't decode it. */
export async function extractAudioWav(uri: string): Promise<Blob | null> {
  try {
    const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    const Ctx = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctx || typeof OfflineAudioContext === 'undefined') return null;
    const data = await (await fetch(uri)).arrayBuffer();
    const ctx = new Ctx();
    // Callback form: older Safari doesn't return a promise from decodeAudioData.
    const decoded = await new Promise<AudioBuffer>((resolve, reject) => ctx.decodeAudioData(data, resolve, reject));
    ctx.close?.();
    const rate = 16000;
    const offline = new OfflineAudioContext(1, Math.max(1, Math.ceil(decoded.duration * rate)), rate);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
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
