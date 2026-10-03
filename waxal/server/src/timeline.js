/** Mirrors src/lib/timeline.ts in the app: map source-video ranges onto the edited timeline. */

export function clipOffsets(clips) {
  const out = [];
  let acc = 0;
  for (const c of clips) {
    out.push(acc);
    acc += c.end - c.start;
  }
  return out;
}

export function timelineDuration(clips) {
  return clips.reduce((s, c) => s + (c.end - c.start), 0);
}

export function sourceRangeToTimeline(clips, start, end) {
  const offsets = clipOffsets(clips);
  const out = [];
  clips.forEach((c, i) => {
    const s = Math.max(start, c.start);
    const e = Math.min(end, c.end);
    if (e - s > 0.01) out.push({ start: offsets[i] + (s - c.start), end: offsets[i] + (e - c.start) });
  });
  return out;
}
