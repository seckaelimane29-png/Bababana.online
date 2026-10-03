import { uid } from '@/lib/id';
import { sourceRangeToTimeline } from '@/lib/timeline';
import type { Caption, Clip, Word } from '@/types';

/** Group transcribed words into short caption lines, breaking on pauses and punctuation. */
export function groupWords(words: Word[], wordsPerLine: number): Caption[] {
  const captions: Caption[] = [];
  let current: Word[] = [];
  const flush = () => {
    if (!current.length) return;
    captions.push({ id: uid('c'), start: current[0].start, end: current[current.length - 1].end, words: current });
    current = [];
  };
  words.forEach((w, i) => {
    const prev = words[i - 1];
    if (current.length && prev && w.start - prev.end > 0.6) flush();
    current.push(w);
    const endsSentence = /[.!?;:]$/.test(w.text);
    if (current.length >= wordsPerLine || endsSentence) flush();
  });
  flush();
  // Close tiny gaps so captions don't flicker between lines.
  for (let i = 0; i < captions.length - 1; i++) {
    const gap = captions[i + 1].start - captions[i].end;
    if (gap > 0 && gap < 0.3) captions[i].end = captions[i + 1].start;
  }
  return captions;
}

export function regroup(captions: Caption[], wordsPerLine: number): Caption[] {
  return groupWords(allWords(captions), wordsPerLine);
}

export function allWords(captions: Caption[]): Word[] {
  return captions.flatMap((c) => c.words);
}

/** Replace a caption's text, spreading the new words evenly over the caption time. */
export function retextCaption(c: Caption, text: string): Caption {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return { ...c, words: [] };
  // Keep the original word timings when the word count did not change.
  if (tokens.length === c.words.length) {
    return { ...c, words: c.words.map((w, i) => ({ ...w, text: tokens[i] })) };
  }
  const span = (c.end - c.start) / tokens.length;
  return {
    ...c,
    words: tokens.map((t, i) => ({ id: uid('w'), text: t, start: c.start + i * span, end: c.start + (i + 1) * span })),
  };
}

export function captionText(c: Caption): string {
  return c.words.map((w) => w.text).join(' ');
}

export function splitCaptionAt(c: Caption, t: number): [Caption, Caption] | null {
  if (t <= c.start + 0.05 || t >= c.end - 0.05) return null;
  const left = c.words.filter((w) => (w.start + w.end) / 2 < t);
  const right = c.words.filter((w) => (w.start + w.end) / 2 >= t);
  return [
    { id: uid('c'), start: c.start, end: t, words: left },
    { id: uid('c'), start: t, end: c.end, words: right },
  ];
}

const FILLERS = new Set(['um', 'uh', 'umm', 'uhm', 'erm', 'er', 'ah', 'hmm', 'mm', 'like,', 'uh,', 'um,']);

export function isFiller(w: Word): boolean {
  return FILLERS.has(w.text.toLowerCase().replace(/[.,!?]/g, '')) || FILLERS.has(w.text.toLowerCase());
}

/**
 * Remove silent gaps longer than `minGap` seconds from the clips (jump cuts).
 * Optionally also removes filler words. Keeps a little padding around speech.
 */
export function cutSilences(clips: Clip[], words: Word[], minGap = 0.7, pad = 0.12, removeFillers = false): Clip[] {
  const speech = words.filter((w) => !(removeFillers && isFiller(w))).sort((a, b) => a.start - b.start);
  if (!speech.length) return clips;
  // Build "keep" ranges from speech.
  const keep: { start: number; end: number }[] = [];
  for (const w of speech) {
    const s = Math.max(0, w.start - pad);
    const e = w.end + pad;
    const last = keep[keep.length - 1];
    if (last && s - last.end < minGap) last.end = Math.max(last.end, e);
    else keep.push({ start: s, end: e });
  }
  const out: Clip[] = [];
  for (const c of clips) {
    for (const k of keep) {
      const s = Math.max(c.start, k.start);
      const e = Math.min(c.end, k.end);
      if (e - s > 0.08) out.push({ id: uid('k'), start: s, end: e });
    }
  }
  return out.length ? out : clips;
}

// ---------- subtitle file export ----------

function pad(n: number, l = 2) {
  return n.toString().padStart(l, '0');
}

function stamp(sec: number, sep: ',' | '.') {
  const ms = Math.round(sec * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)}${sep}${pad(ms % 1000, 3)}`;
}

/** Captions mapped to the edited (cut + sped-up) timeline. */
export function timelineCues(captions: Caption[], clips: Clip[], speed: number) {
  const cues: { start: number; end: number; text: string }[] = [];
  for (const c of captions) {
    const text = captionText(c);
    if (!text) continue;
    for (const r of sourceRangeToTimeline(clips, c.start, c.end)) {
      cues.push({ start: r.start / speed, end: r.end / speed, text });
    }
  }
  return cues.sort((a, b) => a.start - b.start);
}

export function toSRT(captions: Caption[], clips: Clip[], speed: number): string {
  return timelineCues(captions, clips, speed)
    .map((c, i) => `${i + 1}\n${stamp(c.start, ',')} --> ${stamp(c.end, ',')}\n${c.text}\n`)
    .join('\n');
}

export function toVTT(captions: Caption[], clips: Clip[], speed: number): string {
  return (
    'WEBVTT\n\n' +
    timelineCues(captions, clips, speed)
      .map((c) => `${stamp(c.start, '.')} --> ${stamp(c.end, '.')}\n${c.text}\n`)
      .join('\n')
  );
}

export function toPlainText(captions: Caption[]): string {
  return captions.map(captionText).join(' ');
}
