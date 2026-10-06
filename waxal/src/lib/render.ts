import { File, Paths, UploadType } from 'expo-file-system';
import { Platform } from 'react-native';

import { FONTS } from '@/lib/fonts';
import { serverBase, serverHeaders } from '@/lib/settings';
import { uploadInChunks } from '@/lib/webAudio';
import type { Project } from '@/types';

export type RenderStage = { stage: 'upload' | 'render' | 'download' | 'done'; progress: number };

export type RenderOptions = { quality: '720' | '1080' | 'source'; burnCaptions: boolean };

function payload(p: Project, opts: RenderOptions) {
  return JSON.stringify({
    width: p.width,
    height: p.height,
    clips: p.clips,
    captions: opts.burnCaptions ? p.captions : [],
    texts: p.texts,
    style: { ...p.style, fontFamily: FONTS[p.style.font].assFamily },
    textFonts: Object.fromEntries(Object.entries(FONTS).map(([k, v]) => [k, v.assFamily])),
    volume: p.muted ? 0 : p.volume,
    speed: p.speed,
    quality: opts.quality,
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Upload → server renders with ffmpeg (cuts, speed, volume, burned-in animated captions) → download. Returns a local file URI. */
export async function renderVideo(p: Project, opts: RenderOptions, onStage: (s: RenderStage) => void, signal?: { cancelled: boolean }): Promise<string> {
  const base = serverBase();
  if (!base) throw new Error('Add your Waxal server URL in Settings to export videos with burned-in captions.');

  onStage({ stage: 'upload', progress: 0 });
  let job: { id: string };
  if (Platform.OS === 'web') {
    const blob = await (await fetch(p.videoUri)).blob();
    let uploadId: string;
    try {
      uploadId = await uploadInChunks(base, blob, serverHeaders(), (progress) => onStage({ stage: 'upload', progress }));
    } catch {
      throw new Error("Couldn't upload the video. Check your internet connection and try again.");
    }
    const form = new FormData();
    form.append('uploadId', uploadId);
    form.append('project', payload(p, opts));
    const res = await fetch(`${base}/render`, { method: 'POST', body: form, headers: serverHeaders() });
    if (!res.ok) throw new Error(`Export failed (${res.status}): ${await res.text()}`);
    job = await res.json();
  } else {
    const res = await new File(p.videoUri).upload(`${base}/render`, {
      httpMethod: 'POST',
      uploadType: UploadType.MULTIPART,
      fieldName: 'file',
      mimeType: 'video/mp4',
      headers: serverHeaders(),
      parameters: { project: payload(p, opts) },
      onProgress: (d) => d.totalBytes && onStage({ stage: 'upload', progress: d.bytesSent / d.totalBytes }),
    });
    if (res.status >= 400) throw new Error(`Upload failed (${res.status}): ${res.body.slice(0, 200)}`);
    job = JSON.parse(res.body);
  }

  // Poll the render job.
  for (;;) {
    if (signal?.cancelled) throw new Error('Cancelled');
    await sleep(800);
    const res = await fetch(`${base}/render/${job.id}`, { headers: serverHeaders() });
    const status = (await res.json()) as { state: 'queued' | 'running' | 'done' | 'error'; progress: number; error?: string };
    if (status.state === 'error') throw new Error(status.error ?? 'Render failed');
    onStage({ stage: 'render', progress: status.progress ?? 0 });
    if (status.state === 'done') break;
  }

  onStage({ stage: 'download', progress: 0 });
  const url = `${base}/render/${job.id}/file`;
  if (Platform.OS === 'web') {
    onStage({ stage: 'done', progress: 1 });
    const token = serverHeaders()['x-waxal-token'];
    return token ? `${url}?token=${encodeURIComponent(token)}` : url;
  }
  const dest = new File(Paths.cache, `waxal-${p.id}-${Date.now()}.mp4`);
  const file = await File.downloadFileAsync(url, dest, {
    headers: serverHeaders(),
    onProgress: (d) => d.totalBytes && onStage({ stage: 'download', progress: d.bytesWritten / d.totalBytes }),
  });
  onStage({ stage: 'done', progress: 1 });
  return file.uri;
}
