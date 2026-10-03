import { File, Paths, UploadType } from 'expo-file-system';
import { Platform } from 'react-native';

import { uid } from '@/lib/id';
import { serverBase, serverHeaders, useSettings } from '@/lib/settings';
import type { Caption, Word } from '@/types';

const OPENAI = 'https://api.openai.com/v1';
const WHISPER_LIMIT = 25 * 1024 * 1024;

export class AIError extends Error {}

type RawWord = { word: string; start: number; end: number };

function toWords(raw: RawWord[]): Word[] {
  return raw
    .map((w) => ({ id: uid('w'), text: w.word.trim(), start: w.start, end: Math.max(w.end, w.start + 0.05) }))
    .filter((w) => w.text.length > 0);
}

function parseJSON(body: string, status: number) {
  let data: any;
  try {
    data = JSON.parse(body);
  } catch {
    throw new AIError(`Unexpected response (${status}): ${body.slice(0, 200)}`);
  }
  if (status >= 400) throw new AIError(data?.error?.message ?? data?.error ?? `Request failed (${status})`);
  return data;
}

/** Multipart upload of a local video file. Uses the native uploader on iOS/Android (no size issues). */
async function uploadVideo(
  url: string,
  uri: string,
  params: Record<string, string>,
  headers: Record<string, string>,
  onProgress?: (p: number) => void,
): Promise<any> {
  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    const form = new FormData();
    form.append('file', blob, 'video.mp4');
    Object.entries(params).forEach(([k, v]) => form.append(k, v));
    const res = await fetch(url, { method: 'POST', headers, body: form });
    return parseJSON(await res.text(), res.status);
  }
  // Give the upload an .mp4 name: phones record .mov (same container) which some APIs reject by extension.
  const src = new File(uri);
  const tmp = new File(Paths.cache, `upload-${Date.now()}.mp4`);
  await src.copy(tmp);
  try {
    const result = await tmp.upload(url, {
      httpMethod: 'POST',
      uploadType: UploadType.MULTIPART,
      fieldName: 'file',
      mimeType: 'video/mp4',
      headers,
      parameters: params,
      onProgress: onProgress ? (d) => d.totalBytes && onProgress(d.bytesSent / d.totalBytes) : undefined,
    });
    return parseJSON(result.body, result.status);
  } finally {
    try {
      tmp.delete();
    } catch {}
  }
}

export async function transcribe(
  videoUri: string,
  language: string | null,
  onProgress?: (p: number) => void,
): Promise<{ words: Word[]; language: string | null }> {
  const s = useSettings.getState();
  const lang = language && language !== 'auto' ? language : undefined;

  if (s.transcribeVia === 'server') {
    const base = serverBase();
    if (!base) throw new AIError('Add your Woolf server URL in Settings, or switch transcription to "On device".');
    const data = await uploadVideo(`${base}/transcribe`, videoUri, lang ? { language: lang } : {}, serverHeaders(), onProgress);
    return { words: toWords(data.words ?? []), language: data.language ?? lang ?? null };
  }

  if (!s.openaiKey) throw new AIError('Add your OpenAI API key in Settings to generate captions.');
  if (Platform.OS !== 'web') {
    const size = new File(videoUri).size ?? 0;
    if (size > WHISPER_LIMIT) {
      throw new AIError(
        `This video is ${(size / 1048576).toFixed(0)} MB. Direct transcription supports up to 25 MB — set up the Woolf server in Settings for longer videos (it extracts the audio first).`,
      );
    }
  }
  const params: Record<string, string> = {
    model: 'whisper-1',
    response_format: 'verbose_json',
    'timestamp_granularities[]': 'word',
  };
  if (lang) params.language = lang;
  const data = await uploadVideo(`${OPENAI}/audio/transcriptions`, videoUri, params, { Authorization: `Bearer ${s.openaiKey}` }, onProgress);
  return { words: toWords(data.words ?? []), language: data.language ?? lang ?? null };
}

/** Chat completion that must return JSON. Goes direct to OpenAI, or through the server when no key is set. */
async function chatJSON(system: string, user: string): Promise<any> {
  const s = useSettings.getState();
  const body = {
    model: s.chatModel || 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  };
  let res: Response;
  if (s.openaiKey) {
    res = await fetch(`${OPENAI}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${s.openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } else if (serverBase()) {
    res = await fetch(`${serverBase()}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...serverHeaders() },
      body: JSON.stringify(body),
    });
  } else {
    throw new AIError('Add your OpenAI API key (or a Woolf server URL) in Settings.');
  }
  const data = parseJSON(await res.text(), res.status);
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new AIError('The AI returned an empty answer.');
  return JSON.parse(content);
}

export async function translateCaptions(captions: Caption[], targetLanguage: string): Promise<string[]> {
  const lines = captions.map((c) => c.words.map((w) => w.text).join(' '));
  const out = await chatJSON(
    'You translate short video caption lines. Keep each line short, natural and spoken. ' +
      'Return JSON {"lines": string[]} with exactly one translated line per input line, same order.',
    `Target language: ${targetLanguage}\nLines:\n${JSON.stringify(lines)}`,
  );
  const result: unknown = out.lines;
  if (!Array.isArray(result) || result.length !== lines.length) throw new AIError('Translation came back with the wrong number of lines. Try again.');
  return result.map((l) => String(l));
}

export async function highlightKeywords(
  captions: Caption[],
  withEmoji: boolean,
): Promise<{ emphasis: number[]; emoji: string | null }[]> {
  const lines = captions.map((c) => c.words.map((w) => w.text));
  const out = await chatJSON(
    'You style viral short-form video captions. For each caption line (an array of words) pick the 0-1 most ' +
      'important word to emphasise (key nouns, numbers, strong verbs; skip filler lines). ' +
      (withEmoji ? 'Also pick one fitting emoji for lines where it adds energy (about 1 in 3 lines), else null. ' : 'Set emoji to null. ') +
      'Return JSON {"lines": [{"emphasis": number[] (word indexes), "emoji": string|null}]} with one entry per line, same order.',
    JSON.stringify(lines),
  );
  const result: unknown = out.lines;
  if (!Array.isArray(result)) throw new AIError('Could not read the AI answer. Try again.');
  return lines.map((_, i) => {
    const r = (result[i] ?? {}) as { emphasis?: unknown; emoji?: unknown };
    return {
      emphasis: Array.isArray(r.emphasis) ? r.emphasis.filter((n): n is number => typeof n === 'number') : [],
      emoji: typeof r.emoji === 'string' && r.emoji ? r.emoji : null,
    };
  });
}

export const LANGUAGES: { code: string; name: string }[] = [
  { code: 'auto', name: 'Auto-detect' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'ar', name: 'Arabic' },
  { code: 'es', name: 'Spanish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'tr', name: 'Turkish' },
  { code: 'ru', name: 'Russian' },
  { code: 'hi', name: 'Hindi' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'id', name: 'Indonesian' },
  { code: 'sw', name: 'Swahili' },
  { code: 'wo', name: 'Wolof' },
];
