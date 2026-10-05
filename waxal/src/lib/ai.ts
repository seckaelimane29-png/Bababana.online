import { File, Paths, UploadType } from 'expo-file-system';
import { Platform } from 'react-native';

import { uid } from '@/lib/id';
import { serverBase, serverHeaders, useSettings } from '@/lib/settings';
import { extractAudioWav, postForm } from '@/lib/webAudio';
import type { Caption, Word } from '@/types';

const OPENAI = 'https://api.openai.com/v1';
const ELEVENLABS = 'https://api.elevenlabs.io/v1';
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
  audioOnly = false,
): Promise<any> {
  if (Platform.OS === 'web') {
    // Send only the audio when the browser can extract it (a few MB instead of the whole video).
    const audio = audioOnly ? await extractAudioWav(uri) : null;
    const blob = audio ?? (await (await fetch(uri)).blob());
    const form = new FormData();
    form.append('file', blob, audio ? 'audio.wav' : 'video.mp4');
    Object.entries(params).forEach(([k, v]) => form.append(k, v));
    try {
      const res = await postForm(url, form, headers, onProgress);
      return parseJSON(res.body, res.status);
    } catch {
      throw new AIError("Couldn't reach the caption server. Check your internet connection and try again in a minute.");
    }
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
    if (!base) throw new AIError('Add your Waxal server URL in Settings, or switch transcription to "This device".');
    const params: Record<string, string> = { provider: s.sttProvider };
    if (lang) params.language = lang;
    const data = await uploadVideo(`${base}/transcribe`, videoUri, params, serverHeaders(), onProgress, true);
    return { words: toWords(data.words ?? []), language: data.language ?? lang ?? null };
  }

  if (s.sttProvider === 'elevenlabs') {
    if (!s.elevenlabsKey) throw new AIError('Add your ElevenLabs API key in Settings to generate captions.');
    const params: Record<string, string> = {
      model_id: 'scribe_v2',
      timestamps_granularity: 'word',
      tag_audio_events: 'false',
    };
    if (lang) params.language_code = ISO3[lang] ?? lang;
    const data = await uploadVideo(`${ELEVENLABS}/speech-to-text`, videoUri, params, { 'xi-api-key': s.elevenlabsKey }, onProgress);
    return { words: elevenWords(data), language: data.language_code ?? lang ?? null };
  }

  if (!s.openaiKey) throw new AIError('Add your OpenAI API key in Settings to generate captions.');
  if (lang && !OPENAI_LANGS.has(lang)) {
    throw new AIError(`OpenAI does not support ${LANGUAGES.find((l) => l.code === lang)?.name ?? lang}. Switch the caption engine to ElevenLabs in Settings.`);
  }
  if (Platform.OS !== 'web') {
    const size = new File(videoUri).size ?? 0;
    if (size > WHISPER_LIMIT) {
      throw new AIError(
        `This video is ${(size / 1048576).toFixed(0)} MB. OpenAI accepts up to 25 MB — use ElevenLabs or the Waxal server in Settings for longer videos.`,
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

/** ElevenLabs returns words, spaces and audio events; keep only the spoken words. */
export function elevenWords(data: { words?: { text: string; start: number; end: number; type?: string }[] }): Word[] {
  return toWords((data.words ?? []).filter((w) => (w.type ?? 'word') === 'word').map((w) => ({ word: w.text, start: w.start, end: w.end })));
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
    throw new AIError('Add your OpenAI API key (or a Waxal server URL) in Settings.');
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
  { code: 'wo', name: 'Wolof' },
  { code: 'fr', name: 'French' },
  { code: 'en', name: 'English' },
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
  { code: 'ff', name: 'Fula' },
];

/** ElevenLabs takes ISO 639-1 or 639-3 codes; send 639-3, which is how they list Wolof and Fula. */
const ISO3: Record<string, string> = {
  wo: 'wol', ff: 'ful', fr: 'fra', en: 'eng', ar: 'ara', es: 'spa', pt: 'por', de: 'deu', it: 'ita', tr: 'tur',
  ru: 'rus', hi: 'hin', zh: 'cmn', ja: 'jpn', ko: 'kor', nl: 'nld', pl: 'pol', id: 'ind', sw: 'swa',
};

/** Languages in the list above that OpenAI Whisper accepts (Wolof and Fula are not among them). */
const OPENAI_LANGS = new Set(['en', 'fr', 'ar', 'es', 'pt', 'de', 'it', 'tr', 'ru', 'hi', 'zh', 'ja', 'ko', 'nl', 'pl', 'id', 'sw']);
