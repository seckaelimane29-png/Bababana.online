import type { Clip } from '@/types';

/** Total length of the edited timeline (before speed is applied). */
export function timelineDuration(clips: Clip[]): number {
  return clips.reduce((sum, c) => sum + (c.end - c.start), 0);
}

/** Timeline offset where each clip begins. */
export function clipOffsets(clips: Clip[]): number[] {
  const out: number[] = [];
  let acc = 0;
  for (const c of clips) {
    out.push(acc);
    acc += c.end - c.start;
  }
  return out;
}

/** Timeline seconds -> { clip index, source seconds }. */
export function timelineToSource(clips: Clip[], t: number): { index: number; source: number } {
  let acc = 0;
  for (let i = 0; i < clips.length; i++) {
    const len = clips[i].end - clips[i].start;
    if (t < acc + len || i === clips.length - 1) {
      const local = Math.min(Math.max(t - acc, 0), len);
      return { index: i, source: clips[i].start + local };
    }
    acc += len;
  }
  return { index: 0, source: 0 };
}

/**
 * Source seconds -> timeline seconds. `hintIndex` disambiguates when the same
 * source range appears in more than one clip (duplicated clips).
 */
export function sourceToTimeline(clips: Clip[], source: number, hintIndex?: number): number {
  const offsets = clipOffsets(clips);
  if (hintIndex != null && clips[hintIndex]) {
    const c = clips[hintIndex];
    if (source >= c.start - 0.001 && source <= c.end + 0.001) return offsets[hintIndex] + (source - c.start);
  }
  for (let i = 0; i < clips.length; i++) {
    const c = clips[i];
    if (source >= c.start && source < c.end) return offsets[i] + (source - c.start);
  }
  return 0;
}

/** A source range mapped onto the timeline. Ranges that cross cuts come back as several pieces. */
export function sourceRangeToTimeline(clips: Clip[], start: number, end: number): { start: number; end: number }[] {
  const offsets = clipOffsets(clips);
  const out: { start: number; end: number }[] = [];
  clips.forEach((c, i) => {
    const s = Math.max(start, c.start);
    const e = Math.min(end, c.end);
    if (e - s > 0.01) out.push({ start: offsets[i] + (s - c.start), end: offsets[i] + (e - c.start) });
  });
  return out;
}

export function isSourceTimeVisible(clips: Clip[], source: number): boolean {
  return clips.some((c) => source >= c.start && source < c.end);
}

export function formatTime(sec: number, withMs = false): string {
  const s = Math.max(0, sec);
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  const whole = Math.floor(r);
  const base = `${m}:${whole.toString().padStart(2, '0')}`;
  if (!withMs) return base;
  return `${base}.${Math.floor((r - whole) * 10)}`;
}
